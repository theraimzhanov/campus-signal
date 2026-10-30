# Reproduced issues

B01 S2 fixed: generated RSS regex lost escaping; compilation reproduced failure. Replaced with trusted URL prefix check.
B02 S2 fixed: event parser dynamic regex lost whitespace escape; live fixture returned zero events. Attribute-tolerant pattern returned 62 future events.
B03 S3 fixed: inline progress style violated CSP; replaced with native progress and external CSS.
B04 S2 fixed: auth callback could render twice on initialization; initial callback deferred until data loading finishes.

Verification limits: real auth email delivery, provisioned admin browser actions and n8n import/schedules. See backend.md. These are not claimed as completed runtime checks.
