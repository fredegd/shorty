import { supabase, isSupabaseConfigured } from "./supabase";

// Generate random alphanumeric string
export const generateShortCode = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate URL format
export const isValidUrl = (url: string): boolean => {
  return url.startsWith("http://") || url.startsWith("https://");
};

// ===== SUPABASE FUNCTIONS =====

// Check if short code already exists in Supabase
export const checkShortCodeExists = async (
  shortCode: string
): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) return false;

  const { data, error } = await supabase
    .from("urls")
    .select("short_code")
    .eq("short_code", shortCode)
    .single();
  return !error && !!data;
};

// Create a new shortened URL in Supabase
export const createShortUrlSupabase = async (
  originalUrl: string
): Promise<{ shortCode: string; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { shortCode: "", error: "Supabase not configured" };
  }

  try {
    // Generate unique short code
    let shortCode = generateShortCode();
    let attempts = 0;
    const maxAttempts = 10;

    while ((await checkShortCodeExists(shortCode)) && attempts < maxAttempts) {
      shortCode = generateShortCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return { shortCode: "", error: "Failed to generate unique short code" };
    }

    // Insert into database
    const { data, error } = await supabase
      .from("urls")
      .insert([
        {
          short_code: shortCode,
          original_url: originalUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return { shortCode: "", error: "Failed to save URL to database" };
    }

    return { shortCode };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { shortCode: "", error: "An unexpected error occurred" };
  }
};

// Get original URL by short code from Supabase
export const getOriginalUrlSupabase = async (
  shortCode: string
): Promise<{ url?: string; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("urls")
      .select("original_url")
      .eq("short_code", shortCode)
      .single();

    if (error || !data) {
      return { error: "Short URL not found" };
    }

    return { url: data.original_url };
  } catch (error) {
    console.error("Database error:", error);
    return { error: "Failed to retrieve URL" };
  }
};

// Track click and update last accessed in Supabase
export const trackClickSupabase = async (shortCode: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    // Use RPC function for atomic increment, or fallback to two-step process
    const { error } = await supabase.rpc("increment_click_count", {
      short_code_param: shortCode,
    });

    if (error) {
      // Fallback to two-step process if RPC doesn't exist
      console.log("RPC function not found, using fallback method");

      // First, get the current click count
      const { data: currentData, error: fetchError } = await supabase
        .from("urls")
        .select("click_count")
        .eq("short_code", shortCode)
        .single();

      if (fetchError) {
        console.error("Failed to fetch current click count:", fetchError);
        return;
      }

      // Then update with incremented count
      const { error: updateError } = await supabase
        .from("urls")
        .update({
          click_count: (currentData?.click_count || 0) + 1,
          last_accessed: new Date().toISOString(),
        })
        .eq("short_code", shortCode);

      if (updateError) {
        console.error("Failed to update click count:", updateError);
      }
    }
  } catch (error) {
    console.error("Failed to track click:", error);
  }
};

// Debug function to get URL statistics
export const getUrlStats = async (
  shortCode: string
): Promise<{
  click_count?: number;
  last_accessed?: string;
  created_at?: string;
  error?: string;
}> => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: "Supabase not configured" };
  }

  try {
    const { data, error } = await supabase
      .from("urls")
      .select("click_count, last_accessed, created_at")
      .eq("short_code", shortCode)
      .single();

    if (error || !data) {
      return { error: "URL not found" };
    }

    return {
      click_count: data.click_count,
      last_accessed: data.last_accessed,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error("Failed to get URL stats:", error);
    return { error: "Failed to retrieve stats" };
  }
};

// ===== LOCALSTORAGE FALLBACK FUNCTIONS =====

interface UrlMapping {
  [key: string]: string;
}

// Create shortened URL using localStorage fallback
export const createShortUrlLocal = (
  originalUrl: string
): { shortCode: string; error?: string } => {
  try {
    const savedMappings = localStorage.getItem("lisho-mappings");
    const urlMappings: UrlMapping = savedMappings
      ? JSON.parse(savedMappings)
      : {};

    // Generate unique short code
    let shortCode = generateShortCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (urlMappings[shortCode] && attempts < maxAttempts) {
      shortCode = generateShortCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return { shortCode: "", error: "Failed to generate unique short code" };
    }

    // Save to localStorage
    urlMappings[shortCode] = originalUrl;
    localStorage.setItem("lisho-mappings", JSON.stringify(urlMappings));

    return { shortCode };
  } catch (error) {
    console.error("localStorage error:", error);
    return { shortCode: "", error: "Failed to save URL locally" };
  }
};

// Get original URL from localStorage
export const getOriginalUrlLocal = (
  shortCode: string
): { url?: string; error?: string } => {
  try {
    const savedMappings = localStorage.getItem("lisho-mappings");
    if (!savedMappings) {
      return { error: "Short URL not found" };
    }

    const urlMappings: UrlMapping = JSON.parse(savedMappings);
    const url = urlMappings[shortCode];

    if (!url) {
      return { error: "Short URL not found" };
    }

    return { url };
  } catch (error) {
    console.error("localStorage error:", error);
    return { error: "Failed to retrieve URL" };
  }
};

// ===== UNIFIED FUNCTIONS =====

// Create shortened URL (uses Supabase if available, localStorage as fallback)
export const createShortUrl = async (
  originalUrl: string
): Promise<{ shortCode: string; error?: string; isLocal?: boolean }> => {
  if (isSupabaseConfigured) {
    const result = await createShortUrlSupabase(originalUrl);
    return { ...result, isLocal: false };
  } else {
    const result = createShortUrlLocal(originalUrl);
    return { ...result, isLocal: true };
  }
};

// Get original URL (uses Supabase if available, localStorage as fallback)
export const getOriginalUrl = async (
  shortCode: string
): Promise<{ url?: string; error?: string; isLocal?: boolean }> => {
  if (isSupabaseConfigured) {
    const result = await getOriginalUrlSupabase(shortCode);
    return { ...result, isLocal: false };
  } else {
    const result = getOriginalUrlLocal(shortCode);
    return { ...result, isLocal: true };
  }
};

// Track click (only works with Supabase)
export const trackClick = async (shortCode: string): Promise<void> => {
  if (isSupabaseConfigured) {
    await trackClickSupabase(shortCode);
  }
  // No tracking for localStorage fallback
};
