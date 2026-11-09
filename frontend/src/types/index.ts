export type UserRole = 'tenant' | 'property_owner' | 'flat_owner' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AdminMetrics {
  total_users: number;
  tenants_count: number;
  property_owners_count: number;
  flat_owners_count: number;
  admins_count: number;
  active_flats_count: number;
  pending_verifications_count: number;
  verified_users_count: number;
  total_reports_count: number;
  system_status: string;
  timestamp: string;
}

export interface AdminUserItem {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  city: string;
  neighborhood: string;
  trust_score: number;
  aadhaar_verified: boolean;
  work_email_verified: boolean;
}

export interface AdminReportItem {
  id: number;
  action_type: string;
  reason: string;
  description?: string;
  created_at: string;
  reporter_name: string;
  reporter_email?: string;
  target_name: string;
  target_email?: string;
  target_role: string;
  target_is_active: boolean;
}

export interface RoomListing {
  id: number;
  property_id: number;
  title: string;
  room_type: string;
  rent: number;
  deposit: number;
  is_vacant: boolean;
  available_from: string;
  furnishing?: string;
  amenities: string[];
  created_at?: string;
}

export interface PropertyListing {
  id: number;
  owner_id?: number;
  owner?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    trust_score: number;
    verified: boolean;
  };
  title: string;
  description?: string;
  city: string;
  neighborhood: string;
  address?: string;
  property_type: string;
  total_bedrooms: number;
  available_bedrooms: number;
  monthly_rent: number;
  deposit_amount: number;
  furnishing_status: 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished';
  amenities: string[];
  image_urls: string[];
  preferred_gender: string;
  food_preference: string;
  rules?: string[];
  status: 'active' | 'occupied' | 'draft' | 'archived';
  rooms?: RoomListing[];
  applications_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface TenantApplication {
  id: number;
  property_id: number;
  property_title?: string;
  property_city?: string;
  property_neighborhood?: string;
  property_monthly_rent?: number;
  property_image?: string;
  room_id?: number | null;
  room_title?: string | null;
  room_rent?: number | null;
  applicant_id: number;
  applicant?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    occupation?: string;
    company?: string;
    trust_score: number;
    compatibility_score?: number;
  };
  owner_id: number;
  owner_name?: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  move_in_date?: string;
  proposed_budget?: number;
  created_at: string;
  updated_at?: string;

  // Compatibility helpers
  listing_id?: number;
  applicant_name?: string;
  applicant_email?: string;
  applicant_avatar?: string;
  applicant_occupation?: string;
  applicant_company?: string;
  compatibility_score?: number;
  applied_at?: string;
  budget_max?: number;
  trust_score?: number;
}


export interface Profile {
  id: number;
  user_id: number;
  age: number;
  gender: string;
  occupation: string;
  company: string;
  city: string;
  neighborhood: string;
  bio: string;
  avatar_url?: string;
  upi_id?: string;
  budget_min: number;
  budget_max: number;
  housing_status: string;
  target_move_in: string;
  sleep_schedule: string;
  dietary_pref: string;
  non_veg_cooking_allowed: string;
  smoking: string;
  drinking: string;
  cleanliness: number;
  wfh_status: string;
  pet_friendly: string;
  guest_policy: string;
  cook_maid_pref: string;
  interests: string;
}

export interface Verification {
  id: number;
  user_id: number;
  aadhaar_verified: boolean;
  aadhaar_masked?: string;
  pan_verified: boolean;
  pan_masked?: string;
  work_email_verified: boolean;
  work_email?: string;
  company_name?: string;
  phone_verified: boolean;
  trust_score: number;
  verified_at?: string;
}

export interface CompatibilityBreakdown {
  overall_score: number;
  budget_score: number;
  dietary_score: number;
  sleep_score: number;
  cleanliness_score: number;
  social_score: number;
  location_score: number;
  vibe_summary: string;
  highlights: string[];
  watchouts: string[];
}

export interface RoommateMatch {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  profile: Profile;
  verification?: Verification;
  compatibility: CompatibilityBreakdown;
}

export interface FlatMember {
  id: number;
  user_id: number;
  room_label: string;
  monthly_rent_share: number;
  full_name?: string;
  avatar_url?: string;
  upi_id?: string;
}

export interface FlatGroup {
  id: number;
  name: string;
  address?: string;
  city: string;
  total_rent: number;
  created_at: string;
  members: FlatMember[];
}

export interface ExpenseSplit {
  id: number;
  user_id: number;
  user_name?: string;
  amount_owed: number;
  is_paid: boolean;
  paid_at?: string;
  upi_ref?: string;
}

export interface Expense {
  id: number;
  group_id: number;
  title: string;
  category: string;
  total_amount: number;
  paid_by_id: number;
  paid_by_name?: string;
  split_type: string;
  created_at: string;
  splits: ExpenseSplit[];
}

export interface DashboardSummary {
  monthly_rent_share: number;
  flat_name: string;
  pending_to_pay: number;
  owed_to_me: number;
  net_balance: number;
  rent_due_date: string;
  days_left_in_month: number;
  active_roommates_count: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name?: string;
  text: string;
  is_icebreaker: boolean;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar?: string;
  other_user_city?: string;
  other_user_neighborhood?: string;
  last_message?: string;
  last_message_at?: string;
  messages: Message[];
}

export interface SafeMeet {
  id: number;
  sender_id: number;
  receiver_id: number;
  cafe_name: string;
  location_address: string;
  meetup_date: string;
  meetup_time: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface UpiPaymentResponse {
  upi_string: string;
  qr_data_url: string;
  amount: number;
  payee_upi: string;
  payee_name: string;
}
