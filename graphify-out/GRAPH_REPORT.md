# Graph Report - backend  (2026-05-02)

## Corpus Check
- 154 files · ~299,105 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 434 nodes · 650 edges · 16 communities detected
- Extraction: 65% EXTRACTED · 35% INFERRED · 0% AMBIGUOUS · INFERRED: 229 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Database Setup|Database Setup]]
- [[_COMMUNITY_Campaigns|Campaigns]]
- [[_COMMUNITY_Communication Hub|Communication Hub]]
- [[_COMMUNITY_Application Workflow|Application Workflow]]
- [[_COMMUNITY_Admission Workflow|Admission Workflow]]
- [[_COMMUNITY_Counseling Workspace|Counseling Workspace]]
- [[_COMMUNITY_Communication Templates|Communication Templates]]
- [[_COMMUNITY_getGmailTransporter()  getRequiredEmailConfig()|getGmailTransporter() / getRequiredEmailConfig()]]
- [[_COMMUNITY_Communication Hub|Communication Hub]]
- [[_COMMUNITY_Campaigns|Campaigns]]
- [[_COMMUNITY_Backend Documentation|Backend Documentation]]
- [[_COMMUNITY_assertRecipientType()  getRecipientByType()|assertRecipientType() / getRecipientByType()]]
- [[_COMMUNITY_assertRecipientType()  getRecipientByType()|assertRecipientType() / getRecipientByType()]]
- [[_COMMUNITY_Admission Workflow|Admission Workflow]]
- [[_COMMUNITY_AppError  .constructor()|AppError / .constructor()]]
- [[_COMMUNITY_Temporary Output|Temporary Output]]

## God Nodes (most connected - your core abstractions)
1. `API Documentation` - 44 edges
2. `sendSuccess()` - 26 edges
3. `Database Setup Guide` - 25 edges
4. `logError()` - 22 edges
5. `Database Schema` - 22 edges
6. `lead` - 18 edges
7. `Backend README` - 15 edges
8. `Backend Setup Summary` - 15 edges
9. `student` - 15 edges
10. `Folder Structure Guide` - 14 edges

## Surprising Connections (you probably didn't know these)
- `sendCommunication()` --calls--> `sendMailWithGmail()`  [INFERRED]
  services\communicationService.js → config\mailer.js
- `createCampaign()` --calls--> `sendSuccess()`  [INFERRED]
  controllers\campaign.controller.js → utils\apiResponse.js
- `sendCampaign()` --calls--> `sendSuccess()`  [INFERRED]
  controllers\campaign.controller.js → utils\apiResponse.js
- `sendSms()` --calls--> `sendSuccess()`  [INFERRED]
  controllers\sms.controller.js → utils\apiResponse.js
- `sendWhatsapp()` --calls--> `sendSuccess()`  [INFERRED]
  controllers\whatsapp.controller.js → utils\apiResponse.js

## Communities

### Community 0 - "Database Setup"
Cohesion: 0.06
Nodes (29): API Documentation, Backend README, Database Schema, Database Setup Guide, Folder Structure Guide, Parsed Statements, Backend Setup Summary, academic_year (+21 more)

### Community 1 - "Campaigns"
Cohesion: 0.1
Nodes (27): createCampaign(), sendCampaign(), createCampaign(), getCampaigns(), sendCampaign(), getCommunicationLogs(), getRecipients(), sendCommunication() (+19 more)

### Community 2 - "Communication Hub"
Cohesion: 0.11
Nodes (29): createCampaign(), getCampaigns(), sendCampaign(), applyTemplateVariables(), buildComposeLogPayload(), buildTemplateVariables(), getCommunicationLogs(), getRecipients() (+21 more)

### Community 3 - "Application Workflow"
Cohesion: 0.1
Nodes (10): completeAdmissionApplication(), ensureAdmissionResumeColumns(), ensureApplicationFileConstraints(), getAdmissionApplicationById(), getDefaultClassAndSection(), normalizeFileRecord(), saveAdmissionStep(), saveDocuments() (+2 more)

### Community 6 - "Admission Workflow"
Cohesion: 0.19
Nodes (11): buildUploadedFilePath(), createAdmissionFromFormData(), extractClassNumericValue(), insertUploadedDocuments(), moveFilesToAdmissionFolder(), normalizeDigits(), parseAcademicYearLabel(), resolveAcademicYearId() (+3 more)

### Community 7 - "Counseling Workspace"
Cohesion: 0.17
Nodes (2): getDashboardStats(), safeCountQuery()

### Community 9 - "Communication Templates"
Cohesion: 0.18
Nodes (2): buildDisplayName(), resolveApplicationRecipient()

### Community 10 - "getGmailTransporter() / getRequiredEmailConfig()"
Cohesion: 0.36
Nodes (6): getGmailTransporter(), getRequiredEmailConfig(), sendMailWithGmail(), parseRecipients(), processPendingScheduledEmails(), toNodemailerAttachments()

### Community 11 - "Communication Hub"
Cohesion: 0.42
Nodes (7): delay(), dispatchCommunication(), mockProviderResponse(), sendEmail(), sendSMS(), sendWhatsApp(), logInfo()

### Community 12 - "Campaigns"
Cohesion: 0.43
Nodes (5): assertAudienceType(), assertChannel(), createCampaign(), ensureMessageForChannel(), sendCampaign()

### Community 14 - "Backend Documentation"
Cohesion: 0.48
Nodes (5): validateApplicationDocumentTypes(), normalizeApplicationDocumentType(), normalizeToken(), sanitizeApplicationDocumentsPayload(), sanitizeUploadedDocumentFieldName()

### Community 15 - "assertRecipientType() / getRecipientByType()"
Cohesion: 0.47
Nodes (3): assertRecipientType(), getRecipientByType(), sendSms()

### Community 16 - "assertRecipientType() / getRecipientByType()"
Cohesion: 0.47
Nodes (3): assertRecipientType(), getRecipientByType(), sendWhatsapp()

### Community 24 - "Admission Workflow"
Cohesion: 0.67
Nodes (2): getFunnel(), getAdmissionFunnel()

### Community 25 - "AppError / .constructor()"
Cohesion: 0.67
Nodes (1): AppError

### Community 72 - "Temporary Output"
Cohesion: 1.0
Nodes (1): Temporary Output

## Knowledge Gaps
- **1 isolated node(s):** `Temporary Output`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Counseling Workspace`** (13 nodes): `counselingQueries.js`, `createCampusVisit()`, `deleteCampusVisit()`, `getCampusVisitById()`, `getDashboardStats()`, `getFutureVisits()`, `getMissedVisits()`, `getTimeSlotAvailability()`, `getVisitsForCounselor()`, `safeCountQuery()`, `searchLeads()`, `updateCampusVisit()`, `updateVisitStatus()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Communication Templates`** (12 nodes): `buildDisplayName()`, `createTemplate()`, `deleteTemplate()`, `getEmailLogs()`, `getEmailStats()`, `getRecipients()`, `getTemplates()`, `email.service.js`, `resolveApplicationRecipient()`, `sendEmailMessage()`, `updateEmailStatus()`, `updateTemplate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admission Workflow`** (3 nodes): `getFunnel()`, `getAdmissionFunnel()`, `funnelController.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AppError / .constructor()`** (3 nodes): `AppError`, `.constructor()`, `appError.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Temporary Output`** (1 nodes): `Temporary Output`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `API Documentation` connect `Database Setup` to `Application Workflow`, `Counseling Workspace`, `User Administration`, `Authentication`, `User Administration`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **Why does `lead` connect `Database Setup` to `Application Workflow`, `Application Workflow`, `Counseling Workspace`, `Counseling Workspace`, `Lead Management`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `API Documentation` (e.g. with `school` and `academic_year`) actually correct?**
  _`API Documentation` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `sendSuccess()` (e.g. with `createCampaign()` and `sendCampaign()`) actually correct?**
  _`sendSuccess()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `Database Setup Guide` (e.g. with `school` and `academic_year`) actually correct?**
  _`Database Setup Guide` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `logError()` (e.g. with `createCampaign()` and `getCampaigns()`) actually correct?**
  _`logError()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Temporary Output` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._