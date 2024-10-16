GET {{csrf_url}}
HTTP 200
[Captures]
XSRF-TOKEN: cookie "XSRF-TOKEN"
csrf: cookie "_csrf"

POST {{hurlin-export}}
{
  "XSRF-TOKEN": "{{XSRF-TOKEN}}",
  "_csrf": "{{csrf}}"
}
HTTP 200
