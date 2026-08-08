// Aircall API Types
// Reference: https://developer.aircall.io/api-references/

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationMeta {
  count: number;
  total: number;
  current_page: number;
  per_page: number;
  next_page_link: string | null;
  previous_page_link: string | null;
}

export interface AircallError {
  error: string;
  troubleshoot?: string;
}

// ============================================================================
// Call Types
// ============================================================================

export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'initial' | 'answered' | 'done' | 'voicemail';

export interface Call {
  id: number;
  direct_link: string;
  started_at: number;
  answered_at: number | null;
  ended_at: number | null;
  duration: number;
  status: CallStatus;
  direction: CallDirection;
  raw_digits: string;
  asset: string | null;
  recording: string | null;
  voicemail: string | null;
  archived: boolean;
  missed_call_reason: string | null;
  cost: string | null;
  number: PhoneNumber;
  user: User | null;
  contact: Contact | null;
  assigned_to: User | null;
  teams: Team[];
  transferred_by: User | null;
  transferred_to: User | null;
  comments: Comment[];
  tags: Tag[];
  participants: Participant[];
}

export interface CallsListResponse {
  meta: PaginationMeta;
  calls: Call[];
}

export interface CallResponse {
  call: Call;
}

export interface Participant {
  id: number;
  type: 'user' | 'external';
  name: string | null;
  phone_number: string | null;
}

export interface Comment {
  id: number;
  content: string;
  posted_at: number;
  posted_by: User;
}

// AI Insights Types
export interface TranscriptionUtterance {
  start_time?: number;
  end_time?: number;
  duration_ms?: number;
  timestamp?: number;
  text?: string;
  participant_type?: 'internal' | 'external' | string;
  phone_number?: string;
  user_id?: number;
}

export interface Transcription {
  id: number;
  call_id: number;
  call_created_at: string;
  type: 'call' | 'voicemail' | string;
  content: {
    language: string;
    utterances: TranscriptionUtterance[];
  };
}

export interface RealtimeTranscription {
  call_id: number;
  call_uuid: string;
  content?: {
    language: string;
    utterances: TranscriptionUtterance[];
  };
}

export interface CallSummary {
  id: number;
  call_id: number;
  created_at: string;
  content: string;
}

export interface SentimentParticipant {
  phone_number?: string;
  user_id?: number;
  value: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | string;
  type: 'internal' | 'external' | string;
}

export interface CallSentiment {
  id: number;
  call_id: number;
  participants: SentimentParticipant[];
}

export interface CallTopics {
  id: number;
  call_id: number;
  created_at: string;
  content: string[];
}

export interface CallActionItem {
  id: number;
  ai_generated: boolean;
  content: string;
  created_at: string;
  created_by: number | null;
  updated_at: string | null;
  updated_by: number | null;
}

// ============================================================================
// Contact Types
// ============================================================================

export interface Contact {
  id: number;
  direct_link: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  information: string | null;
  is_shared: boolean;
  created_at: number;
  updated_at: number;
  phone_numbers: ContactPhoneNumber[];
  emails: ContactEmail[];
}

export interface ContactPhoneNumber {
  id: number;
  label: string;
  value: string;
}

export interface ContactEmail {
  id: number;
  label: string;
  value: string;
}

export interface ContactsListResponse {
  meta: PaginationMeta;
  contacts: Contact[];
}

export interface ContactResponse {
  contact: Contact;
}

export interface CreateContactInput {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  information?: string;
  phone_numbers?: Array<{ label: string; value: string }>;
  emails?: Array<{ label: string; value: string }>;
}

export interface UpdateContactInput {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  information?: string;
}

// ============================================================================
// User Types
// ============================================================================

export type UserState = 'available' | 'unavailable' | 'custom' | 'after_call_work' | 'do_not_disturb';

export interface User {
  id: number;
  direct_link: string;
  name: string;
  email: string;
  created_at: number;
  available: boolean;
  availability_status: UserState;
  numbers: PhoneNumber[];
  time_zone: string | null;
  language: string | null;
  wrap_up_time: number;
}

export interface UsersListResponse {
  meta: PaginationMeta;
  users: User[];
}

export interface UserResponse {
  user: User;
}

export interface UserAvailability {
  user_id: number;
  available: boolean;
  availability_status: UserState;
  custom_status: string | null;
}

export interface CreateUserInput {
  email: string;
  first_name: string;
  last_name: string;
  role_id?: string;
  is_admin?: boolean;
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  role_id?: string;
  wrap_up_time?: number;
}

// ============================================================================
// Team Types
// ============================================================================

export interface Team {
  id: number;
  direct_link: string;
  name: string;
  created_at: number;
  users: User[];
  numbers: PhoneNumber[];
}

export interface TeamsListResponse {
  meta: PaginationMeta;
  teams: Team[];
}

export interface TeamResponse {
  team: Team;
}

export interface CreateTeamInput {
  name: string;
}

// ============================================================================
// Phone Number Types
// ============================================================================

export interface PhoneNumber {
  id: number;
  direct_link: string;
  name: string;
  digits: string;
  country: string;
  time_zone: string;
  open: boolean;
  availability_status: 'open' | 'closed' | 'custom';
  is_ivr: boolean;
  live_recording_activated: boolean;
  messages: NumberMessages;
  priority: number | null;
  users: User[];
  created_at: number;
}

export interface NumberMessages {
  welcome: string | null;
  waiting: string | null;
  ringing_tone: string | null;
  unanswered_call: string | null;
  after_hours: string | null;
  ivr: string | null;
  voicemail: string | null;
  closed: string | null;
  callback_later: string | null;
  hold_music: string | null;
}

export interface NumbersListResponse {
  meta: PaginationMeta;
  numbers: PhoneNumber[];
}

export interface NumberResponse {
  number: PhoneNumber;
}

export interface UpdateNumberInput {
  name?: string;
  time_zone?: string;
  priority?: number;
}

// ============================================================================
// Tag Types
// ============================================================================

export interface Tag {
  id: number;
  direct_link: string;
  name: string;
  color: string;
  description: string | null;
  created_at: number;
}

export interface TagsListResponse {
  meta: PaginationMeta;
  tags: Tag[];
}

export interface TagResponse {
  tag: Tag;
}

export interface CreateTagInput {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
  description?: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

export type WebhookEvent =
  | 'call.created'
  | 'call.ringing_on_agent'
  | 'call.agent_declined'
  | 'call.answered'
  | 'call.transferred'
  | 'call.ended'
  | 'call.voicemail_left'
  | 'call.tagged'
  | 'call.untagged'
  | 'call.commented'
  | 'call.archived'
  | 'call.assigned'
  | 'contact.created'
  | 'contact.updated'
  | 'contact.deleted'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.connected'
  | 'user.disconnected'
  | 'user.opened'
  | 'user.closed'
  | 'user.wut_started'
  | 'user.wut_ended'
  | 'number.created'
  | 'number.deleted'
  | 'number.opened'
  | 'number.closed'
  | 'message.created'
  | 'message.received';

export interface Webhook {
  webhook_id: string;
  direct_link: string;
  url: string;
  active: boolean;
  created_at: number;
  events: WebhookEvent[];
  token: string;
}

export interface WebhooksListResponse {
  meta: PaginationMeta;
  webhooks: Webhook[];
}

export interface WebhookResponse {
  webhook: Webhook;
}

export interface CreateWebhookInput {
  url: string;
  events: WebhookEvent[];
}

export interface UpdateWebhookInput {
  url?: string;
  events?: WebhookEvent[];
  active?: boolean;
}

// ============================================================================
// SMS/Messages Types
// ============================================================================

export interface Message {
  id: number;
  direct_link: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'failed' | 'received';
  body: string;
  number: PhoneNumber;
  contact: Contact | null;
  user: User | null;
  external_number: string;
  created_at: number;
  media_urls: string[];
}

export interface MessagesListResponse {
  meta: PaginationMeta;
  messages: Message[];
}

export interface MessageResponse {
  message: Message;
}

export interface SendMessageInput {
  from: number; // number ID
  to: string; // phone number
  body: string;
}

export interface MessageConfig {
  id: number;
  number_id: number;
  enabled: boolean;
  webhook_url: string | null;
}

// ============================================================================
// Dialer Campaign Types
// ============================================================================

export interface DialerCampaign {
  id: number;
  direct_link: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  created_at: number;
  updated_at: number;
  numbers_count: number;
  dialed_count: number;
  users: User[];
}

export interface CampaignsListResponse {
  meta: PaginationMeta;
  campaigns: DialerCampaign[];
}

export interface CampaignResponse {
  campaign: DialerCampaign;
}

export interface CampaignNumber {
  id: number;
  phone_number: string;
  contact: Contact | null;
  status: 'pending' | 'dialed' | 'completed' | 'skipped';
  notes: string | null;
}

export interface CampaignNumbersResponse {
  meta: PaginationMeta;
  phone_numbers: CampaignNumber[];
}

export interface CreateCampaignInput {
  name: string;
  user_ids?: number[];
}

export interface AddCampaignNumbersInput {
  phone_numbers: Array<{
    phone_number: string;
    contact_id?: number;
    notes?: string;
  }>;
}

// ============================================================================
// Company Types
// ============================================================================

export interface Company {
  name: string;
  users_count: number;
  numbers_count: number;
  created_at: number;
}

export interface CompanyResponse {
  company: Company;
}

// ============================================================================
// Integration Types
// ============================================================================

export interface Integration {
  id: number;
  name: string;
  logo_url: string;
  enabled: boolean;
  connected_at: number | null;
}

export interface IntegrationsListResponse {
  integrations: Integration[];
}

// ============================================================================
// Toolset Configuration
// ============================================================================

export type ToolCategory =
  | 'calls'
  | 'contacts'
  | 'users'
  | 'teams'
  | 'numbers'
  | 'tags'
  | 'webhooks'
  | 'messages'
  | 'dialer'
  | 'company'
  | 'integrations';

export const READ_ONLY_TOOLS = [
  // Misc - read operations
  'aircall_ping',
  // Calls - read operations
  'aircall_list_calls',
  'aircall_get_call',
  'aircall_search_calls',
  'aircall_get_transcript',
  'aircall_get_realtime_transcript',
  'aircall_get_summary',
  'aircall_get_sentiments',
  'aircall_get_topics',
  'aircall_get_action_items',
  'aircall_get_predicted_csat',
  'aircall_get_custom_summary',
  'aircall_get_playbook_result',
  'aircall_get_evaluations',
  // Contacts - read operations
  'aircall_list_contacts',
  'aircall_search_contacts',
  'aircall_get_contact',
  // Users - read operations
  'aircall_list_users',
  'aircall_get_user',
  'aircall_check_availability',
  'aircall_list_availabilities',
  'aircall_get_user_numbers',
  // Teams - read operations
  'aircall_list_teams',
  'aircall_get_team',
  // Numbers - read operations
  'aircall_list_numbers',
  'aircall_get_number',
  'aircall_get_registration_status',
  // Tags - read operations
  'aircall_list_tags',
  'aircall_get_tag',
  // Webhooks - read operations
  'aircall_list_webhooks',
  'aircall_get_webhook',
  // Messages - read operations
  'aircall_get_config',
  // Dialer - read operations
  'aircall_get_campaign',
  'aircall_get_campaign_numbers',
  // Company - read operations
  'aircall_get_company',
  'aircall_get_integration',
] as const;

export const WRITE_TOOLS = [
  'aircall_add_comment',
  'aircall_add_tags',
  'aircall_archive_call',
  'aircall_unarchive_call',
  'aircall_transfer_call',
  'aircall_pause_recording',
  'aircall_resume_recording',
  'aircall_delete_recording',
  'aircall_delete_voicemail',
  'aircall_push_insight_card',
  'aircall_trigger_agent_call',
  'aircall_create_contact',
  'aircall_update_contact',
  'aircall_delete_contact',
  'aircall_add_phone',
  'aircall_update_phone',
  'aircall_delete_phone',
  'aircall_add_email',
  'aircall_update_email',
  'aircall_delete_email',
  'aircall_create_user',
  'aircall_update_user',
  'aircall_delete_user',
  'aircall_start_call',
  'aircall_dial',
  'aircall_create_team',
  'aircall_delete_team',
  'aircall_add_user_to_team',
  'aircall_remove_user_from_team',
  'aircall_update_number',
  'aircall_update_messages',
  'aircall_create_tag',
  'aircall_update_tag',
  'aircall_delete_tag',
  'aircall_create_webhook',
  'aircall_update_webhook',
  'aircall_delete_webhook',
  'aircall_send_message',
  'aircall_send_agent_message',
  'aircall_create_config',
  'aircall_delete_config',
  'aircall_create_campaign',
  'aircall_delete_campaign',
  'aircall_add_campaign_numbers',
  'aircall_remove_campaign_number',
  'aircall_enable_integration',
  'aircall_disable_integration',
] as const;

export type ReadOnlyTool = typeof READ_ONLY_TOOLS[number];
export type WriteTool = typeof WRITE_TOOLS[number];
export type AircallTool = ReadOnlyTool | WriteTool;
