GET {{hurlin-async}}./image1.hurl
HTTP 200
[Captures]
w1: jsonpath "$.await"

GET {{hurlin-async}}./image2.hurl
HTTP 200
[Captures]
w2: jsonpath "$.await"

GET {{hurlin-await}}{{w1}}
HTTP 200

GET {{hurlin-await}}{{w2}}
HTTP 200
