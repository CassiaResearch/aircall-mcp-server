# Sales Workflow Examples

Common AI-powered sales workflows using the Aircall MCP server.

## 1. Post-Call Summary & CRM Update

After each call, automatically generate a summary and update your CRM.

```
Workflow:
1. aircall_list_calls (filter: last hour)
2. For each new call:
   - aircall_get_summary
   - aircall_get_action_items
   - aircall_get_sentiments
3. Format and send to CRM via webhook
```

**Example prompt:**
> "Get the summary and action items from my last call, then create a follow-up task"

## 2. Lead Qualification from Calls

Analyze call sentiment and topics to qualify leads.

```
Workflow:
1. aircall_get_call (call_id)
2. aircall_get_sentiments
3. aircall_get_topics
4. Score lead based on sentiment + topics mentioned
```

**Example prompt:**
> "Analyze my last 5 calls and tell me which prospects seemed most interested based on sentiment"

## 3. Automated Contact Creation

Create contacts from incoming calls automatically.

```
Workflow:
1. aircall_list_calls (direction: inbound, last 24h)
2. For calls without contact:
   - aircall_create_contact with caller info
   - aircall_add_tags to the call
```

**Example prompt:**
> "Find all incoming calls from today that don't have a contact and create contacts for them"

## 4. Call Tagging Based on Content

Auto-tag calls based on transcript content.

```
Workflow:
1. aircall_get_transcript (call_id)
2. Analyze transcript for keywords (pricing, demo, complaint)
3. aircall_add_tags with appropriate tag IDs
```

**Example prompt:**
> "Tag all calls from this week where the customer mentioned 'pricing' or 'discount'"

## 5. Team Availability Dashboard

Check which agents are available for calls.

```
Workflow:
1. aircall_list_availabilities
2. aircall_list_users (for names)
3. Display available agents
```

**Example prompt:**
> "Show me which sales reps are available to take calls right now"

## 6. Power Dialer Campaign Setup

Create an outbound calling campaign.

```
Workflow:
1. aircall_create_campaign (name: "Q1 Outreach")
2. aircall_add_campaign_numbers (list of prospects)
3. Assign users to campaign
```

**Example prompt:**
> "Create a power dialer campaign called 'Demo Follow-ups' and add these 10 phone numbers"

## 7. Call Quality Monitoring

Review call quality across the team.

```
Workflow:
1. aircall_list_calls (last week)
2. For each call:
   - aircall_get_sentiments
3. Aggregate sentiment by user
4. Flag calls with negative sentiment
```

**Example prompt:**
> "Show me all calls from last week with negative customer sentiment, grouped by agent"

## 8. Webhook for Real-Time Updates

Set up real-time notifications for call events.

```
Workflow:
1. aircall_create_webhook
   - url: "https://your-app.com/aircall-events"
   - events: ["call.ended", "call.voicemail_left"]
```

**Example prompt:**
> "Create a webhook that notifies my app when calls end or voicemails are left"

## 9. SMS Follow-Up After Missed Call

Send automatic SMS when calls are missed.

```
Workflow:
1. Listen for missed call webhook
2. aircall_send_message
   - from: your Aircall number ID
   - to: caller's number
   - body: "Sorry we missed your call..."
```

**Example prompt:**
> "Send an SMS to +1234567890 saying 'Thanks for calling, we'll get back to you soon'"

## 10. Daily Call Report

Generate a daily summary of call activity.

```
Workflow:
1. aircall_list_calls (today)
2. Group by: user, direction, status
3. Calculate: total duration, answer rate
4. Format report
```

**Example prompt:**
> "Give me a summary of today's calls - total count, average duration, and calls by agent"
