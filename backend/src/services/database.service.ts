import { supabase } from '../config/supabase';
import { Asset } from '../types';
import { logger } from '../utils/logger';

/**
 * Database Service
 * Handles Supabase database operations for assets, documents, and nominees
 */

/**
 * Get all assets for a specific user based on their role
 * - Owners see their own assets
 * - Nominees see assets shared with them
 * - Admins see all assets
 * RLS policies enforce access control
 * 
 * @param userId - User's unique identifier
 * @param role - User's role (owner, nominee, admin)
 * @returns Array of assets with owner information
 */
export async function getAssetsByUserId(
  userId: string,
  role: 'owner' | 'nominee' | 'admin'
): Promise<{
  success: boolean;
  assets?: Asset[];
  error?: string;
}> {
  try {
    let query = supabase
      .from('assets')
      .select(`
        *,
        owner:users!assets_owner_id_fkey(id, email, role),
        documents(id, asset_id, file_name, file_path, file_size, uploaded_at),
        linked_nominees(
          id,
          asset_id,
          nominee_id,
          linked_at,
          nominee:nominees!linked_nominees_nominee_id_fkey(
            id,
            user_id,
            created_at,
            user:users!nominees_user_id_fkey(id, email, role)
          )
        )
      `)
      .order('created_at', { ascending: false });

    // RLS policies will automatically filter based on user role
    // But we can add explicit filters for clarity
    if (role === 'owner') {
      query = query.eq('owner_id', userId);
    } else if (role === 'nominee') {
      // For nominees, we need to join through linked_nominees
      // RLS will handle this, but we can be explicit
      const { data: linkedAssets, error: linkedError } = await supabase
        .from('linked_nominees')
        .select('asset_id')
        .eq('nominee_id', userId);

      if (linkedError) {
        logger.error('Error fetching linked assets:', linkedError);
        return {
          success: false,
          error: 'Failed to fetch linked assets',
        };
      }

      const assetIds = linkedAssets?.map(ln => ln.asset_id) || [];
      if (assetIds.length === 0) {
        return {
          success: true,
          assets: [],
        };
      }

      query = query.in('id', assetIds);
    }
    // For admin, no filter needed - RLS allows access to all

    const { data, error } = await query;

    if (error) {
      logger.error('Supabase error fetching assets:', error);
      return {
        success: false,
        error: 'Failed to fetch assets',
      };
    }

    return {
      success: true,
      assets: data as Asset[],
    };
  } catch (error) {
    logger.error('Unexpected error fetching assets:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get a single asset by ID with all related data
 * Includes documents and linked nominees
 * RLS policies enforce access control
 * 
 * @param assetId - Asset's unique identifier
 * @returns Asset with documents and linked nominees
 */
export async function getAssetById(
  assetId: string
): Promise<{
  success: boolean;
  asset?: Asset;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .select(`
        *,
        owner:users!assets_owner_id_fkey(id, email, role),
        documents(id, asset_id, file_name, file_path, file_size, uploaded_at),
        linked_nominees(
          id,
          asset_id,
          nominee_id,
          linked_at,
          nominee:nominees!linked_nominees_nominee_id_fkey(
            id,
            user_id,
            created_at,
            user:users!nominees_user_id_fkey(id, email, role)
          )
        )
      `)
      .eq('id', assetId)
      .single();

    if (error) {
      logger.error('Supabase error fetching asset:', error);
      
      // Handle not found or access denied
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Asset not found or access denied',
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch asset',
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    return {
      success: true,
      asset: data as Asset,
    };
  } catch (error) {
    logger.error('Unexpected error fetching asset:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Create a new asset for the authenticated user
 * 
 * @param userId - Owner's user ID
 * @param title - Asset title
 * @param category - Asset category
 * @returns Created asset
 */
export async function createAsset(
  userId: string,
  title: string,
  category: 'Legal' | 'Financial' | 'Medical' | 'Personal' | 'Other'
): Promise<{
  success: boolean;
  asset?: Asset;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert({
        owner_id: userId,
        title,
        category,
      })
      .select(`
        *,
        owner:users!assets_owner_id_fkey(id, email, role),
        documents(id, asset_id, file_name, file_path, file_size, uploaded_at),
        linked_nominees(
          id,
          asset_id,
          nominee_id,
          linked_at,
          nominee:nominees!linked_nominees_nominee_id_fkey(
            id,
            user_id,
            created_at,
            user:users!nominees_user_id_fkey(id, email, role)
          )
        )
      `)
      .single();

    if (error) {
      logger.error('Supabase error creating asset:', error);
      return {
        success: false,
        error: 'Failed to create asset',
      };
    }

    return {
      success: true,
      asset: data as Asset,
    };
  } catch (error) {
    logger.error('Unexpected error creating asset:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Update an existing asset's title or category
 * RLS policies ensure only the owner can update
 * 
 * @param assetId - Asset's unique identifier
 * @param userId - Owner's user ID (for verification)
 * @param updates - Fields to update (title and/or category)
 * @returns Updated asset
 */
export async function updateAsset(
  assetId: string,
  userId: string,
  updates: {
    title?: string;
    category?: 'Legal' | 'Financial' | 'Medical' | 'Personal' | 'Other';
  }
): Promise<{
  success: boolean;
  asset?: Asset;
  error?: string;
}> {
  try {
    // First verify ownership
    const { data: existingAsset, error: fetchError } = await supabase
      .from('assets')
      .select('owner_id')
      .eq('id', assetId)
      .single();

    if (fetchError || !existingAsset) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    if (existingAsset.owner_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized: You can only update your own assets',
      };
    }

    // Perform update
    const { data, error } = await supabase
      .from('assets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assetId)
      .select(`
        *,
        owner:users!assets_owner_id_fkey(id, email, role),
        documents(id, asset_id, file_name, file_path, file_size, uploaded_at),
        linked_nominees(
          id,
          asset_id,
          nominee_id,
          linked_at,
          nominee:nominees!linked_nominees_nominee_id_fkey(
            id,
            user_id,
            created_at,
            user:users!nominees_user_id_fkey(id, email, role)
          )
        )
      `)
      .single();

    if (error) {
      logger.error('Supabase error updating asset:', error);
      return {
        success: false,
        error: 'Failed to update asset',
      };
    }

    return {
      success: true,
      asset: data as Asset,
    };
  } catch (error) {
    logger.error('Unexpected error updating asset:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Delete an asset and all associated documents (cascade)
 * RLS policies ensure only the owner can delete
 * 
 * @param assetId - Asset's unique identifier
 * @param userId - Owner's user ID (for verification)
 * @returns Success status
 */
export async function deleteAsset(
  assetId: string,
  userId: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // First verify ownership
    const { data: existingAsset, error: fetchError } = await supabase
      .from('assets')
      .select('owner_id')
      .eq('id', assetId)
      .single();

    if (fetchError || !existingAsset) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    if (existingAsset.owner_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized: You can only delete your own assets',
      };
    }

    // Delete asset (documents will cascade due to ON DELETE CASCADE)
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (error) {
      logger.error('Supabase error deleting asset:', error);
      return {
        success: false,
        error: 'Failed to delete asset',
      };
    }

    return {
      success: true,
      message: 'Asset deleted successfully',
    };
  } catch (error) {
    logger.error('Unexpected error deleting asset:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get asset statistics for admin dashboard
 * Returns total assets, total documents, and storage usage
 * 
 * @returns Asset statistics
 */
export async function getAssetStats(): Promise<{
  success: boolean;
  stats?: {
    totalAssets: number;
    totalDocuments: number;
    storageUsed: number; // in bytes
    assetsByCategory: {
      category: string;
      count: number;
    }[];
  };
  error?: string;
}> {
  try {
    // Get total assets count
    const { count: totalAssets, error: assetsError } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true });

    if (assetsError) {
      logger.error('Error fetching assets count:', assetsError);
      return {
        success: false,
        error: 'Failed to fetch asset statistics',
      };
    }

    // Get total documents count and storage used
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('file_size');

    if (documentsError) {
      logger.error('Error fetching documents:', documentsError);
      return {
        success: false,
        error: 'Failed to fetch document statistics',
      };
    }

    const totalDocuments = documents?.length || 0;
    const storageUsed = documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;

    // Get assets by category
    const { data: assetsByCategory, error: categoryError } = await supabase
      .from('assets')
      .select('category');

    if (categoryError) {
      logger.error('Error fetching assets by category:', categoryError);
      return {
        success: false,
        error: 'Failed to fetch category statistics',
      };
    }

    // Count assets by category
    const categoryCounts = assetsByCategory?.reduce((acc, asset) => {
      const category = asset.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const assetsByCategoryArray = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    return {
      success: true,
      stats: {
        totalAssets: totalAssets || 0,
        totalDocuments,
        storageUsed,
        assetsByCategory: assetsByCategoryArray,
      },
    };
  } catch (error) {
    logger.error('Unexpected error fetching asset stats:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get all users with nominee role
 * Returns list of nominees that can be linked to assets
 * 
 * @returns Array of nominees with user information
 */
export async function getNominees(): Promise<{
  success: boolean;
  nominees?: Array<{
    id: string;
    user_id: string;
    created_at: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('nominees')
      .select(`
        id,
        user_id,
        created_at,
        user:users!nominees_user_id_fkey(id, email, role)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Supabase error fetching nominees:', error);
      return {
        success: false,
        error: 'Failed to fetch nominees',
      };
    }

    return {
      success: true,
      nominees: data as any || [],
    };
  } catch (error) {
    logger.error('Unexpected error fetching nominees:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Link a nominee to an asset
 * Verifies asset ownership before creating the link
 * 
 * @param assetId - Asset's unique identifier
 * @param nomineeId - Nominee's unique identifier
 * @param userId - Owner's user ID (for verification)
 * @returns Created linked nominee record
 */
export async function linkNominee(
  assetId: string,
  nomineeId: string,
  userId: string
): Promise<{
  success: boolean;
  linkedNominee?: {
    id: string;
    asset_id: string;
    nominee_id: string;
    linked_at: string;
  };
  error?: string;
}> {
  try {
    // First verify asset ownership
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('owner_id')
      .eq('id', assetId)
      .single();

    if (assetError || !asset) {
      return {
        success: false,
        error: 'Asset not found',
      };
    }

    if (asset.owner_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized: You can only link nominees to your own assets',
      };
    }

    // Verify nominee exists
    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .select('id')
      .eq('id', nomineeId)
      .single();

    if (nomineeError || !nominee) {
      return {
        success: false,
        error: 'Nominee not found',
      };
    }

    // Check if link already exists
    const { data: existingLink, error: checkError } = await supabase
      .from('linked_nominees')
      .select('id')
      .eq('asset_id', assetId)
      .eq('nominee_id', nomineeId)
      .maybeSingle();

    if (checkError) {
      logger.error('Error checking existing link:', checkError);
      return {
        success: false,
        error: 'Failed to check existing link',
      };
    }

    if (existingLink) {
      return {
        success: false,
        error: 'Nominee is already linked to this asset',
      };
    }

    // Create the link
    const { data, error } = await supabase
      .from('linked_nominees')
      .insert({
        asset_id: assetId,
        nominee_id: nomineeId,
      })
      .select()
      .single();

    if (error) {
      logger.error('Supabase error linking nominee:', error);
      return {
        success: false,
        error: 'Failed to link nominee',
      };
    }

    return {
      success: true,
      linkedNominee: data,
    };
  } catch (error) {
    logger.error('Unexpected error linking nominee:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Unlink a nominee from an asset
 * Verifies asset ownership before removing the link
 * 
 * @param linkedNomineeId - Linked nominee record's unique identifier
 * @param userId - Owner's user ID (for verification)
 * @returns Success status
 */
export async function unlinkNominee(
  linkedNomineeId: string,
  userId: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // First get the linked nominee record to verify ownership
    const { data: linkedNominee, error: fetchError } = await supabase
      .from('linked_nominees')
      .select(`
        id,
        asset_id,
        assets!linked_nominees_asset_id_fkey(owner_id)
      `)
      .eq('id', linkedNomineeId)
      .single();

    if (fetchError || !linkedNominee) {
      return {
        success: false,
        error: 'Linked nominee record not found',
      };
    }

    // Verify ownership
    const asset = linkedNominee.assets as any;
    if (asset.owner_id !== userId) {
      return {
        success: false,
        error: 'Unauthorized: You can only unlink nominees from your own assets',
      };
    }

    // Delete the link
    const { error } = await supabase
      .from('linked_nominees')
      .delete()
      .eq('id', linkedNomineeId);

    if (error) {
      logger.error('Supabase error unlinking nominee:', error);
      return {
        success: false,
        error: 'Failed to unlink nominee',
      };
    }

    return {
      success: true,
      message: 'Nominee unlinked successfully',
    };
  } catch (error) {
    logger.error('Unexpected error unlinking nominee:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get all nominees linked to a specific asset
 * Returns nominees with user information
 * 
 * @param assetId - Asset's unique identifier
 * @returns Array of linked nominees
 */
export async function getLinkedNominees(
  assetId: string
): Promise<{
  success: boolean;
  linkedNominees?: Array<{
    id: string;
    asset_id: string;
    nominee_id: string;
    linked_at: string;
    nominee: {
      id: string;
      user_id: string;
      created_at: string;
      user: {
        id: string;
        email: string;
        role: string;
      };
    };
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('linked_nominees')
      .select(`
        id,
        asset_id,
        nominee_id,
        linked_at,
        nominee:nominees!linked_nominees_nominee_id_fkey(
          id,
          user_id,
          created_at,
          user:users!nominees_user_id_fkey(id, email, role)
        )
      `)
      .eq('asset_id', assetId)
      .order('linked_at', { ascending: false });

    if (error) {
      logger.error('Supabase error fetching linked nominees:', error);
      return {
        success: false,
        error: 'Failed to fetch linked nominees',
      };
    }

    return {
      success: true,
      linkedNominees: data as any || [],
    };
  } catch (error) {
    logger.error('Unexpected error fetching linked nominees:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// Admin Management Functions
// ============================================================================

/**
 * Get all users with pagination support
 * Admin-only function to view all users in the system
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Number of users per page
 * @param searchQuery - Optional search query to filter by email
 * @returns Paginated list of users with total count
 */
export async function getAllUsers(
  page: number = 1,
  limit: number = 10,
  searchQuery?: string
): Promise<{
  success: boolean;
  users?: Array<{
    id: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('users')
      .select('id, email, role, created_at, updated_at', { count: 'exact' });

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      query = query.ilike('email', `%${searchQuery.trim()}%`);
    }

    // Add pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Supabase error fetching users:', error);
      return {
        success: false,
        error: 'Failed to fetch users',
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      users: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    logger.error('Unexpected error fetching users:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get all assets with pagination for admin view
 * Admin-only function to view all assets in the system
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Number of assets per page
 * @param searchQuery - Optional search query to filter by title
 * @param categoryFilter - Optional category filter
 * @returns Paginated list of assets with owner information and total count
 */
export async function getAllAssets(
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
  categoryFilter?: string
): Promise<{
  success: boolean;
  assets?: Array<{
    id: string;
    owner_id: string;
    title: string;
    category: string;
    created_at: string;
    updated_at: string;
    owner: {
      id: string;
      email: string;
      role: string;
    };
    documents: Array<{
      id: string;
      asset_id: string;
      file_name: string;
      file_path: string;
      file_size: number;
      uploaded_at: string;
    }>;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('assets')
      .select(`
        id,
        owner_id,
        title,
        category,
        created_at,
        updated_at,
        owner:users!assets_owner_id_fkey(id, email, role),
        documents(id, asset_id, file_name, file_path, file_size, uploaded_at)
      `, { count: 'exact' });

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      query = query.ilike('title', `%${searchQuery.trim()}%`);
    }

    // Add category filter if provided
    if (categoryFilter && categoryFilter.trim()) {
      query = query.eq('category', categoryFilter.trim());
    }

    // Add pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Supabase error fetching assets:', error);
      return {
        success: false,
        error: 'Failed to fetch assets',
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      assets: data as any || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    logger.error('Unexpected error fetching assets:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get detailed information for a specific user
 * Admin-only function to view user details including their assets
 * 
 * @param userId - User's unique identifier
 * @returns User details with assets and statistics
 */
export async function getUserById(
  userId: string
): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    assets?: Array<{
      id: string;
      title: string;
      category: string;
      created_at: string;
      documents: Array<{
        id: string;
        file_name: string;
        file_size: number;
      }>;
    }>;
    stats?: {
      totalAssets: number;
      totalDocuments: number;
      storageUsed: number;
    };
  };
  error?: string;
}> {
  try {
    // Get user information
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (userError) {
      logger.error('Supabase error fetching user:', userError);
      
      if (userError.code === 'PGRST116') {
        return {
          success: false,
          error: 'User not found',
        };
      }
      
      return {
        success: false,
        error: 'Failed to fetch user',
      };
    }

    if (!userData) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Get user's assets if they are an owner
    let assets: any[] = [];
    let stats = {
      totalAssets: 0,
      totalDocuments: 0,
      storageUsed: 0,
    };

    if (userData.role === 'owner') {
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select(`
          id,
          title,
          category,
          created_at,
          documents(id, file_name, file_size)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (!assetsError && assetsData) {
        assets = assetsData;
        stats.totalAssets = assetsData.length;
        
        // Calculate document stats
        assetsData.forEach((asset: any) => {
          if (asset.documents) {
            stats.totalDocuments += asset.documents.length;
            asset.documents.forEach((doc: any) => {
              stats.storageUsed += doc.file_size || 0;
            });
          }
        });
      }
    }

    return {
      success: true,
      user: {
        ...userData,
        assets: assets.length > 0 ? assets : undefined,
        stats: userData.role === 'owner' ? stats : undefined,
      },
    };
  } catch (error) {
    logger.error('Unexpected error fetching user:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Update user status or role
 * Admin-only function to enable/disable accounts or change user roles
 * 
 * @param userId - User's unique identifier
 * @param updates - Fields to update (role)
 * @returns Updated user information
 */
export async function updateUserStatus(
  userId: string,
  updates: {
    role?: 'owner' | 'nominee' | 'admin';
  }
): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    updated_at: string;
  };
  error?: string;
}> {
  try {
    // Verify user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email, role, updated_at')
      .single();

    if (error) {
      logger.error('Supabase error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user',
      };
    }

    return {
      success: true,
      user: data,
    };
  } catch (error) {
    logger.error('Unexpected error updating user:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get system-wide statistics for admin dashboard
 * Returns comprehensive metrics about users, assets, and storage
 * 
 * @returns System statistics
 */
export async function getSystemStats(): Promise<{
  success: boolean;
  stats?: {
    totalUsers: number;
    totalAssets: number;
    totalDocuments: number;
    storageUsed: number;
    usersByRole: {
      role: string;
      count: number;
    }[];
    assetsByCategory: {
      category: string;
      count: number;
    }[];
    recentActivity: {
      recentUsers: number; // Users created in last 30 days
      recentAssets: number; // Assets created in last 30 days
    };
  };
  error?: string;
}> {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      logger.error('Error fetching users count:', usersError);
      return {
        success: false,
        error: 'Failed to fetch system statistics',
      };
    }

    // Get total assets count
    const { count: totalAssets, error: assetsError } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true });

    if (assetsError) {
      logger.error('Error fetching assets count:', assetsError);
      return {
        success: false,
        error: 'Failed to fetch system statistics',
      };
    }

    // Get total documents count and storage used
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('file_size');

    if (documentsError) {
      logger.error('Error fetching documents:', documentsError);
      return {
        success: false,
        error: 'Failed to fetch document statistics',
      };
    }

    const totalDocuments = documents?.length || 0;
    const storageUsed = documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;

    // Get users by role
    const { data: usersByRole, error: roleError } = await supabase
      .from('users')
      .select('role');

    if (roleError) {
      logger.error('Error fetching users by role:', roleError);
      return {
        success: false,
        error: 'Failed to fetch role statistics',
      };
    }

    // Count users by role
    const roleCounts = usersByRole?.reduce((acc, user) => {
      const role = user.role;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const usersByRoleArray = Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
    }));

    // Get assets by category
    const { data: assetsByCategory, error: categoryError } = await supabase
      .from('assets')
      .select('category');

    if (categoryError) {
      logger.error('Error fetching assets by category:', categoryError);
      return {
        success: false,
        error: 'Failed to fetch category statistics',
      };
    }

    // Count assets by category
    const categoryCounts = assetsByCategory?.reduce((acc, asset) => {
      const category = asset.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const assetsByCategoryArray = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const { count: recentUsers, error: recentUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgoISO);

    const { count: recentAssets, error: recentAssetsError } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgoISO);

    if (recentUsersError || recentAssetsError) {
      logger.error('Error fetching recent activity:', recentUsersError || recentAssetsError);
      // Don't fail the entire request, just set to 0
    }

    return {
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalAssets: totalAssets || 0,
        totalDocuments,
        storageUsed,
        usersByRole: usersByRoleArray,
        assetsByCategory: assetsByCategoryArray,
        recentActivity: {
          recentUsers: recentUsers || 0,
          recentAssets: recentAssets || 0,
        },
      },
    };
  } catch (error) {
    logger.error('Unexpected error fetching system stats:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
