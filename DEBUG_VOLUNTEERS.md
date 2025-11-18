# Debug Volunteers Not Showing

Run these queries in your Supabase SQL Editor to diagnose the issue:

## 1. Check All Volunteer Profiles

```sql
SELECT 
  id,
  email,
  first_name,
  last_name,
  onboarding_completed,
  is_admin,
  availability_days
FROM profiles
WHERE onboarding_completed = true;
```

**What to look for:**
- Is your test user in this list?
- Is `onboarding_completed` = `true`?
- Is `is_admin` = `false` or `null`?
- Is `availability_days` an array like `{Tuesday,Thursday}` or `["Tuesday","Thursday"]`?

## 2. Check Specific User

```sql
-- Replace with your test user's email
SELECT 
  id,
  email,
  first_name,
  last_name,
  onboarding_completed,
  is_admin,
  availability_days,
  created_at
FROM profiles
WHERE email = 'test-user@example.com';
```

## 3. Check if Availability Days Format is Correct

```sql
SELECT 
  email,
  first_name,
  last_name,
  availability_days,
  'Tuesday' = ANY(availability_days) as has_tuesday,
  'Thursday' = ANY(availability_days) as has_thursday
FROM profiles
WHERE onboarding_completed = true;
```

**Expected result:** `has_tuesday` and `has_thursday` should be `true` for your test user.

## 4. Common Issues & Fixes

### Issue A: `availability_days` is NULL
```sql
-- Check if it's null
SELECT email, availability_days 
FROM profiles 
WHERE availability_days IS NULL;

-- Fix: Set availability manually
UPDATE profiles
SET availability_days = ARRAY['Tuesday', 'Thursday']
WHERE email = 'test-user@example.com';
```

### Issue B: `availability_days` is Empty Array
```sql
-- Check if it's empty
SELECT email, availability_days 
FROM profiles 
WHERE availability_days = ARRAY[]::text[];

-- Fix: Set availability manually
UPDATE profiles
SET availability_days = ARRAY['Tuesday', 'Thursday']
WHERE email = 'test-user@example.com';
```

### Issue C: User is Admin
```sql
-- Check if user is marked as admin
SELECT email, is_admin 
FROM profiles 
WHERE email = 'test-user@example.com';

-- Fix: Set is_admin to false
UPDATE profiles
SET is_admin = false
WHERE email = 'test-user@example.com';
```

### Issue D: Onboarding Not Complete
```sql
-- Check onboarding status
SELECT email, onboarding_completed 
FROM profiles 
WHERE email = 'test-user@example.com';

-- Fix: Mark onboarding as complete
UPDATE profiles
SET onboarding_completed = true
WHERE email = 'test-user@example.com';
```

### Issue E: Wrong Day Format (lowercase vs capitalized)
```sql
-- Check if days are lowercase
SELECT 
  email,
  availability_days,
  CASE 
    WHEN 'tuesday' = ANY(availability_days) THEN 'lowercase'
    WHEN 'Tuesday' = ANY(availability_days) THEN 'capitalized'
    ELSE 'neither'
  END as format
FROM profiles
WHERE email = 'test-user@example.com';

-- Fix if lowercase: Update to capitalized
UPDATE profiles
SET availability_days = ARRAY['Tuesday', 'Thursday']
WHERE email = 'test-user@example.com';
```

## 5. Test the Full Query

This simulates what the admin portal does:

```sql
-- For Tuesday
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.email,
  p.availability_days,
  'Tuesday' = ANY(p.availability_days) as is_available_tuesday
FROM profiles p
WHERE p.onboarding_completed = true
  AND (p.is_admin IS NULL OR p.is_admin = false);
```

**Expected:** Your test user should appear with `is_available_tuesday = true`

## 6. Quick Fix for Test User

If you just want to quickly fix your test user:

```sql
-- Replace with your test user's email
UPDATE profiles
SET 
  onboarding_completed = true,
  is_admin = false,
  availability_days = ARRAY['Tuesday', 'Thursday'],
  first_name = COALESCE(first_name, 'Test'),
  last_name = COALESCE(last_name, 'User')
WHERE email = 'test-user@example.com';
```

## 7. Verify RLS Policies

Make sure admins can see all volunteers:

```sql
-- Check if RLS is blocking the query
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';
```

You should have a policy that allows admins to read all profiles.

If not, create it:

```sql
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid() 
      AND p2.is_admin = true
    )
  );
```

