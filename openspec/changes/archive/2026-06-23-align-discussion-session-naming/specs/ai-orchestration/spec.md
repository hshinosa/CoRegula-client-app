## MODIFIED Requirements

### Requirement: Anomaly detection runs without TypeError

The `detect_course_anomalies` method can iterate over multiple sessions without raising a `TypeError` from the recursive `detect_session_anomalies` call.

#### Scenario: Course with multiple sessions
- **WHEN** `detect_course_anomalies` finds events for multiple sessions
- **THEN** it calls `detect_session_anomalies` with the correct keyword argument (`chat_space_id=` not `case_id=`)
- **AND** no `TypeError` is raised

### Requirement: Course-level anomaly grouping uses CaseID

The course-level anomaly grouping reads a field that is actually written by the logging system, so course metrics are not always empty.

#### Scenario: Course metrics count sessions
- **WHEN** `detect_course_anomalies` or `_calculate_course_metrics` groups events
- **THEN** it groups by `CaseID` prefix (or a field that `mongodb_logger` actually writes)
- **AND** sessions with events are counted correctly

### Requirement: Group status endpoints return valid responses

The `/api/groups/{group_id}/status`, `/track-participation`, `/update-last-message`, and `/set-topic` endpoints delegate to `LogicListener` via `Orchestrator` and return without `AttributeError`.

#### Scenario: GET /groups/{group_id}/status
- **WHEN** a client calls `GET /api/groups/{group_id}/status`
- **THEN** the Orchestrator delegates to `logic_listener.get_group_status(group_id)`
- **AND** the response contains the group status

#### Scenario: POST /groups/{group_id}/track-participation
- **WHEN** a client calls `POST /api/groups/{group_id}/track-participation`
- **THEN** the Orchestrator delegates to `logic_listener.track_participation`
- **AND** no `AttributeError` is raised

### Requirement: Dead code removed

`batch_routes.py` is deleted. `AskRequest.chat_space_id` field is removed.

#### Scenario: batch_routes.py deleted
- **WHEN** the ai-engine starts
- **THEN** `batch_routes.py` does not exist
- **AND** no reference to `batch_routes` remains in `routes/__init__.py`

#### Scenario: AskRequest has no chat_space_id
- **WHEN** a client sends a POST to `/api/ask`
- **THEN** the request schema does not include `chat_space_id`
- **AND** the `field_validator` does not reference `chat_space_id`

## REMOVED Requirements

### Requirement: Background silence monitor using deprecated check_silence

**Reason**: `silence_monitor_task` in `main.py` calls `logic_listener.check_silence` which is marked DEPRECATED (MINOR-02, "superseded by core-api silence/escalation system"). The background task causes duplicate silence interventions.

**Migration**: Remove the `silence_monitor_task` from `main.py` lifespan. Core-api's socket.io silence detection handles this.
