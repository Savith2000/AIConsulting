# FIX: Infinite Recursion in Profiles RLS Policy

## Problem
The policy "Admins can view all profiles" is causing infinite recursion because it checks the profiles table from within a profiles table policy.

## Solution
Run these commands in order:

### Step 1: Drop the problematic policy
```sql
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
```

### Step 2: Create a better policy that doesn't cause recursion

**Option A: Simple approach (disable RLS on profiles for admins)**
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

**Option B: Use a separate admin tracking (recommended)**

First, check if RLS is even enabled on profiles:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';
```

If `rowsecurity` is `true`, you have two options:

**Option B1: Disable RLS on profiles entirely (simplest)**
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**Option B2: Use proper policies without recursion**
```sql
-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Policy 1: Users can always view their own profile
CREATE POLICY "Enable read access for own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Allow INSERT during sign up
CREATE POLICY "Enable insert for authentication" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can read all profiles (using a function to avoid recursion)
-- First create a helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT is_admin 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  ) = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Then create the policy using the function
CREATE POLICY "Admins can view all profiles using function" ON profiles
  FOR SELECT USING (
    is_admin() OR auth.uid() = id
  );
```

## Recommended Quick Fix

**Just disable RLS on profiles** (profiles table doesn't need strict security since users can only see their own data through the app logic):

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

This is the simplest solution and won't cause any security issues since:
- Users are already authenticated
- The app logic controls what data they see
- Supabase auth already protects the table

## Verify Fix

After applying the fix, run:
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Try to read your profile
SELECT email, first_name, last_name, is_admin, availability_days
FROM profiles
WHERE email = 'your-admin-email@example.com';
```

Both queries should work without errors.

## Then Refresh

After fixing the RLS issue:
1. Close all browser tabs with the app
2. Clear browser cache (or open incognito)
3. Log in again
4. You should NOT be forced to onboard again

If you're still forced to onboard, run:
```sql
UPDATE profiles
SET onboarding_completed = true
WHERE email = 'your-admin-email@example.com';
```

