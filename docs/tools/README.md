# Aircall MCP Server - Tool Reference

Complete reference for all 83 tools. This file is generated from the
server itself - regenerate with `npm run docs` after changing any tool.

## Tool Categories

| Category | Tools | Description |
|----------|-------|-------------|
| [Calls](#calls) | 24 | Call history, transcriptions, AI insights, and in-call actions |
| [Contacts](#contacts) | 12 | Contact directory CRUD, phone numbers, and emails |
| [Users](#users) | 10 | User management, availability, and outbound calling |
| [Teams](#teams) | 6 | Team management and membership |
| [Numbers](#numbers) | 5 | Phone number configuration and compliance |
| [Tags](#tags) | 5 | Call tagging |
| [Webhooks](#webhooks) | 5 | Real-time event notifications |
| [Messages](#messages) | 5 | SMS/MMS sending and number messaging configuration |
| [Dialer](#dialer) | 6 | Per-user power dialer campaigns |
| [Company](#company) | 5 | Connectivity, account info, and integration state |

---

## Calls

### aircall_list_calls

List calls with optional filters. Returns paginated call history with details including direction, status, duration, and associated contacts/users.

*read-only*

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `per_page` (number, optional) - Results per page (default: 20, max: 50)
- `order` (string, optional) - Sort order by date
- `from` (number, optional) - Filter calls from this Unix timestamp
- `to` (number, optional) - Filter calls to this Unix timestamp
- `direction` (string, optional) - Filter by call direction

### aircall_get_call

Get detailed information about a specific call including comments, tags, participants, and recording URLs.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_search_calls

Search calls by phone number, tags, user, or number. More flexible than list_calls for finding specific calls.

*read-only*

**Parameters:**
- `phone_number` (string, optional) - Search by phone number
- `tags` (array, optional) - Filter by tag names
- `user_id` (number, optional) - Filter by user ID
- `number_id` (number, optional) - Filter by Aircall number ID
- `from` (number, optional) - From Unix timestamp
- `to` (number, optional) - To Unix timestamp

### aircall_get_transcript

Get the transcription of a call. Returns speaker-attributed utterances with timestamps.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_realtime_transcript

Get real-time transcription for an ongoing call. Use this during active calls to see live transcription.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_summary

Get the AI-generated summary of a call.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_sentiments

Get sentiment analysis for a call. Returns per-participant sentiment values (POSITIVE/NEUTRAL/NEGATIVE).

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_topics

Get key topics discussed during a call.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_action_items

Get AI-detected action items from a call.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_predicted_csat

Get the AI-predicted customer satisfaction (CSAT) score for a call.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_custom_summary

Get the custom summary result for a call (requires AI Assist Pro). Returns results for each custom summary template section.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_playbook_result

Get the playbook result for a call, including adherence score and per-topic results.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_get_evaluations

Get call quality evaluations (scorecards, feedback, scores) for a call.

*read-only*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_add_comment

Add a comment to a call. Comments are visible in the Aircall dashboard.

*write*

**Parameters:**
- `call_id` (number, required) - The call ID
- `content` (string, required) - Comment content

### aircall_add_tags

Add tags to a call. Tags help categorize and filter calls.

*write*

**Parameters:**
- `call_id` (number, required) - The call ID
- `tags` (array, required) - Array of tag IDs to add

### aircall_archive_call

Archive a call. Archived calls are hidden from the main call list.

*write*

**Parameters:**
- `call_id` (number, required) - The call ID to archive

### aircall_unarchive_call

Unarchive a previously archived call, restoring it to the main call list.

*write*

**Parameters:**
- `call_id` (number, required) - The call ID to archive

### aircall_transfer_call

Transfer an active call to another user.

*write*

**Parameters:**
- `call_id` (number, required) - The call ID
- `user_id` (number, required) - User ID to transfer to

### aircall_pause_recording

Pause recording on an active call. Useful for sensitive information.

*write*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_resume_recording

Resume recording on an active call after it was paused.

*write*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_delete_recording

Permanently delete the recording of a call. This cannot be undone.

*write, destructive*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_delete_voicemail

Permanently delete the voicemail of a call. This cannot be undone.

*write, destructive*

**Parameters:**
- `call_id` (number, required) - The call ID

### aircall_push_insight_card

Push an insight card with contextual info to the agent's Phone app during an ongoing call. Contents are blocks like {type: "title"|"shortText", text: ...} or {type: "link", link: ..., label: ...}.

*write*

**Parameters:**
- `call_id` (number, required) - The ongoing call ID
- `contents` (array, required) - Content blocks to display on the card

### aircall_trigger_agent_call

Trigger an outbound call handled by an Aircall AI Voice Agent. The agent must be configured in the Aircall Dashboard with a connected number and first message. Every {{variable}} in the agent's messages must have a matching key in context.

*write*

**Parameters:**
- `agent_id` (string, required) - The AI Voice Agent ID (configured in the Aircall Dashboard)
- `contact_phone` (string, required) - Phone number to call (E.164 format)
- `idempotency_key` (string, required) - Unique key to prevent duplicate calls (e.g. "appt-reminder-2026-08-07-cust-123")
- `context` (object, optional) - Values for {{variable}} placeholders in the agent's messages. ISO 8601 UTC datetimes require a "timezone" key.
- `expiration_seconds` (number, optional) - How long the call request stays valid before expiring

---

## Contacts

### aircall_list_contacts

List all contacts with pagination. Returns contact details including phone numbers and emails.

*read-only*

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `per_page` (number, optional) - Results per page (default: 20, max: 50)
- `order` (string, optional) - Sort order
- `from` (number, optional) - Filter contacts created from this Unix timestamp
- `to` (number, optional) - Filter contacts created to this Unix timestamp

### aircall_search_contacts

Search contacts by phone number or email. Returns matching contacts.

*read-only*

**Parameters:**
- `phone_number` (string, optional) - Search by phone number
- `email` (string, optional) - Search by email

### aircall_get_contact

Get detailed information about a specific contact.

*read-only*

**Parameters:**
- `contact_id` (number, required) - The contact ID

### aircall_create_contact

Create a new contact with optional phone numbers and emails.

*write*

**Parameters:**
- `first_name` (string, optional) - First name
- `last_name` (string, optional) - Last name
- `company_name` (string, optional) - Company name
- `information` (string, optional) - Additional notes about the contact
- `phone_numbers` (array, optional) - Phone numbers to add
- `emails` (array, optional) - Email addresses to add

### aircall_update_contact

Update an existing contact's basic information.

*write, destructive*

**Parameters:**
- `contact_id` (number, required) - The contact ID
- `first_name` (string, optional) - First name
- `last_name` (string, optional) - Last name
- `company_name` (string, optional) - Company name
- `information` (string, optional) - Additional notes

### aircall_delete_contact

Delete a contact. This action cannot be undone.

*write, destructive*

**Parameters:**
- `contact_id` (number, required) - The contact ID to delete

### aircall_add_phone

Add a phone number to an existing contact.

*write*

**Parameters:**
- `contact_id` (number, required) - The contact ID
- `label` (string, required) - Label (e.g., Work, Mobile, Home)
- `value` (string, required) - Phone number

### aircall_update_phone

Update a phone number on a contact.

*write, destructive*

**Parameters:**
- `contact_id` (number, required) - The contact ID
- `phone_id` (number, required) - The phone number ID
- `label` (string, optional) - New label
- `value` (string, optional) - New phone number

### aircall_delete_phone

Delete a phone number from a contact.

*write, destructive*

**Parameters:**
- `contact_id` (number, required) - The contact ID
- `phone_id` (number, required) - The phone number ID to delete

### aircall_add_email

Add an email address to an existing contact.

*write*

**Parameters:**
- `contact_id` (number, required) - The contact ID
- `label` (string, required) - Label (e.g., Work, Personal)
- `value` (string, required) - Email address

### aircall_update_email

Update an email address on a contact.

*write, destructive*

**Parameters:**
- `contact_id` (number, required) - The contact ID
- `email_id` (number, required) - The email ID to update
- `label` (string, optional) - Email label (e.g. Work, Personal)
- `value` (string, optional) - The email address

### aircall_delete_email

Delete an email address from a contact.

*write, destructive*

**Parameters:**
- `contact_id` (number, required) - The contact ID
- `email_id` (number, required) - The email ID to delete

---

## Users

### aircall_list_users

List all users in the Aircall account with their availability status and assigned numbers.

*read-only*

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `per_page` (number, optional) - Results per page (default: 20, max: 50)
- `order` (string, optional) - Sort order

### aircall_get_user

Get detailed information about a specific user including their numbers and availability.

*read-only*

**Parameters:**
- `user_id` (number, required) - The user ID

### aircall_create_user

Create a new user in Aircall. An invitation email will be sent.

*write*

**Parameters:**
- `email` (string, required) - User email address
- `first_name` (string, required) - First name
- `last_name` (string, required) - Last name
- `role_id` (string, optional) - Role ID to assign
- `is_admin` (boolean, optional) - Whether user should be an admin

### aircall_update_user

Update a user's profile information.

*write, destructive*

**Parameters:**
- `user_id` (number, required) - The user ID
- `first_name` (string, optional) - First name
- `last_name` (string, optional) - Last name
- `role_id` (string, optional) - Role ID
- `wrap_up_time` (number, optional) - Wrap-up time in seconds

### aircall_delete_user

Delete a user from Aircall. This action cannot be undone.

*write, destructive*

**Parameters:**
- `user_id` (number, required) - The user ID to delete

### aircall_check_availability

Check if a specific user is currently available to take calls.

*read-only*

**Parameters:**
- `user_id` (number, required) - The user ID

### aircall_list_availabilities

Get availability status for all users. Useful for routing calls or finding available agents.

*read-only*

**Parameters:** none

### aircall_start_call

Initiate an outbound call on behalf of a user. The user's phone will ring first, then connect to the destination.

*write*

**Parameters:**
- `user_id` (number, required) - The user ID who will make the call
- `number_id` (number, required) - The Aircall number ID to call from
- `to` (string, required) - Phone number to call

### aircall_dial

Open the Aircall phone app with a number pre-dialed. The user can then initiate the call manually.

*write*

**Parameters:**
- `user_id` (number, required) - The user ID
- `to` (string, required) - Phone number to dial (opens in Aircall phone)

### aircall_get_user_numbers

Get all phone numbers assigned to a specific user (API v2).

*read-only*

**Parameters:**
- `user_id` (number, required) - The user ID

---

## Teams

### aircall_list_teams

List all teams with their members and assigned numbers.

*read-only*

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `per_page` (number, optional) - Results per page (default: 20, max: 50)
- `order` (string, optional) - Sort order

### aircall_get_team

Get detailed information about a specific team including all members and numbers.

*read-only*

**Parameters:**
- `team_id` (number, required) - The team ID

### aircall_create_team

Create a new team. Teams group users together for call routing and organization.

*write*

**Parameters:**
- `name` (string, required) - Team name

### aircall_delete_team

Delete a team. Users in the team will not be deleted.

*write, destructive*

**Parameters:**
- `team_id` (number, required) - The team ID to delete

### aircall_add_user_to_team

Add a user to a team. Users can belong to multiple teams.

*write*

**Parameters:**
- `team_id` (number, required) - The team ID
- `user_id` (number, required) - The user ID to add

### aircall_remove_user_from_team

Remove a user from a team.

*write, destructive*

**Parameters:**
- `team_id` (number, required) - The team ID
- `user_id` (number, required) - The user ID to remove

---

## Numbers

### aircall_list_numbers

List all phone numbers in the account with their configuration and assigned users.

*read-only*

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `per_page` (number, optional) - Results per page (default: 20, max: 50)
- `order` (string, optional) - Sort order

### aircall_get_number

Get detailed information about a specific phone number including users and message configuration.

*read-only*

**Parameters:**
- `number_id` (number, required) - The phone number ID

### aircall_update_number

Update a phone number's configuration like name, timezone, or priority.

*write, destructive*

**Parameters:**
- `number_id` (number, required) - The phone number ID
- `name` (string, optional) - Display name for the number
- `time_zone` (string, optional) - Time zone (e.g., America/New_York)
- `priority` (number, optional) - Priority for call routing

### aircall_update_messages

Update audio messages and music for a phone number (welcome, waiting, voicemail, etc.). Provide URLs to audio files.

*write, destructive*

**Parameters:**
- `number_id` (number, required) - The phone number ID
- `welcome` (string, optional) - Welcome message URL
- `waiting` (string, optional) - Waiting music URL
- `ringing_tone` (string, optional) - Ringing tone URL
- `unanswered_call` (string, optional) - Unanswered call message URL
- `after_hours` (string, optional) - After hours message URL
- `ivr` (string, optional) - IVR message URL
- `voicemail` (string, optional) - Voicemail greeting URL
- `closed` (string, optional) - Closed message URL
- `callback_later` (string, optional) - Callback later message URL
- `hold_music` (string, optional) - Hold music URL

### aircall_get_registration_status

Get the registration status for a phone number. Important for compliance in some regions.

*read-only*

**Parameters:**
- `number_id` (number, required) - The phone number ID

---

## Tags

### aircall_list_tags

List all tags available for categorizing calls.

*read-only*

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `per_page` (number, optional) - Results per page (default: 20, max: 50)
- `order` (string, optional) - Sort order

### aircall_get_tag

Get detailed information about a specific tag.

*read-only*

**Parameters:**
- `tag_id` (number, required) - The tag ID

### aircall_create_tag

Create a new tag for categorizing calls.

*write*

**Parameters:**
- `name` (string, required) - Tag name
- `color` (string, optional) - Tag color (hex code, e.g., #FF5733)
- `description` (string, optional) - Tag description

### aircall_update_tag

Update an existing tag.

*write, destructive*

**Parameters:**
- `tag_id` (number, required) - The tag ID
- `name` (string, optional) - New tag name
- `color` (string, optional) - New tag color (hex code)
- `description` (string, optional) - New tag description

### aircall_delete_tag

Delete a tag. Existing calls with this tag will lose it.

*write, destructive*

**Parameters:**
- `tag_id` (number, required) - The tag ID to delete

---

## Webhooks

### aircall_list_webhooks

List all configured webhooks. Webhooks send real-time notifications for events like calls, contacts, and user status changes.

*read-only*

**Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `per_page` (number, optional) - Results per page (default: 20, max: 50)

### aircall_get_webhook

Get detailed information about a specific webhook including its subscribed events.

*read-only*

**Parameters:**
- `webhook_id` (string, required) - The webhook ID

### aircall_create_webhook

Create a new webhook to receive real-time event notifications at a URL.

*write*

**Parameters:**
- `url` (string, required) - URL to receive webhook events
- `events` (array, required) - List of events to subscribe to

### aircall_update_webhook

Update a webhook's URL, events, or active status.

*write, destructive*

**Parameters:**
- `webhook_id` (string, required) - The webhook ID
- `url` (string, optional) - New URL
- `events` (array, optional) - New list of events
- `active` (boolean, optional) - Enable or disable the webhook

### aircall_delete_webhook

Delete a webhook. The URL will no longer receive event notifications.

*write, destructive*

**Parameters:**
- `webhook_id` (string, required) - The webhook ID to delete

---

## Messages

### aircall_send_message

Send an SMS/MMS from an Aircall number, bypassing the Aircall Inbox. The number must have messaging configured.

*write*

**Parameters:**
- `number_id` (number, required) - Aircall number ID to send from (must have messaging enabled)
- `to` (string, required) - Phone number to send to (E.164 format)
- `body` (string, required) - Message content (max 1600 characters)
- `media_url` (array, optional) - Optional media URLs to attach (MMS)

### aircall_send_agent_message

Send a message in an existing agent conversation thread (appears in the Aircall Inbox). Use this to reply to ongoing conversations.

*write*

**Parameters:**
- `number_id` (number, required) - Aircall number ID the conversation belongs to
- `to` (string, required) - Phone number of the conversation participant (E.164 format)
- `body` (string, required) - Message content

### aircall_create_config

Create the messaging configuration for an Aircall number, optionally setting a callback URL for incoming message events.

*write*

**Parameters:**
- `number_id` (number, required) - The Aircall number ID
- `callback_url` (string, optional) - URL that receives message.received / message.status_updated callbacks

### aircall_get_config

Get the messaging configuration for an Aircall number.

*read-only*

**Parameters:**
- `number_id` (number, required) - The Aircall number ID

### aircall_delete_config

Delete the messaging configuration for an Aircall number.

*write, destructive*

**Parameters:**
- `number_id` (number, required) - The Aircall number ID

---

## Dialer

### aircall_get_campaign

Get a user's active power dialer campaign. Each user has at most one active campaign.

*read-only*

**Parameters:**
- `user_id` (number, required) - The user ID whose dialer campaign to target

### aircall_create_campaign

Create an active power dialer campaign for a user with a list of phone numbers to dial. A user can have only one active campaign.

*write*

**Parameters:**
- `user_id` (number, required) - The user ID to create the campaign for
- `phone_numbers` (array, required) - Phone numbers to dial (E.164 format)

### aircall_delete_campaign

Delete a user's power dialer campaign.

*write, destructive*

**Parameters:**
- `user_id` (number, required) - The user ID whose dialer campaign to target

### aircall_get_campaign_numbers

Get the phone numbers in a user's power dialer campaign.

*read-only*

**Parameters:**
- `user_id` (number, required) - The user ID whose campaign numbers to fetch
- `page` (number, optional) - Page number
- `per_page` (number, optional) - Results per page

### aircall_add_campaign_numbers

Add phone numbers to a user's power dialer campaign.

*write*

**Parameters:**
- `user_id` (number, required) - The user ID whose campaign to add numbers to
- `phone_numbers` (array, required) - Phone numbers to add (E.164 format)

### aircall_remove_campaign_number

Remove a phone number from a user's power dialer campaign.

*write, destructive*

**Parameters:**
- `user_id` (number, required) - The user ID whose campaign to modify
- `phone_number_id` (number, required) - The phone number ID to remove

---

## Company

### aircall_ping

Test connectivity and credentials against the Aircall API. Use this to troubleshoot the connection.

*read-only*

**Parameters:** none

### aircall_get_company

Get information about the Aircall company account including user and number counts.

*read-only*

**Parameters:** none

### aircall_get_integration

Get information about the integration associated with the current API credentials (only available for OAuth or Aircall-built integrations).

*read-only*

**Parameters:** none

### aircall_enable_integration

Enable the integration associated with the current API credentials.

*write*

**Parameters:** none

### aircall_disable_integration

Disable the integration associated with the current API credentials.

*write*

**Parameters:** none
