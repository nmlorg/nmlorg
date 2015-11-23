#!/bin/bash

function asserteq() {
  ACTUAL=$(cat /tmp/test.out)
  EXPECTED=${1}
  if [[ "${ACTUAL}" != "${EXPECTED}" && ! "${ACTUAL}" =~ ${EXPECTED} ]]; then
    echo "Assertion failed:"
    echo " Expected: \"${EXPECTED}\""
    echo "   Actual: \"${ACTUAL}\""
    exit 1
  fi
}


curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "1999-01-01T00:00:00", "location": {"x": 1, "y": 1}}' --header content-type:application/json > /tmp/test.out
asserteq '{"id": [0-9]+}'

curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "1999-02-01T00:00:00", "location": {"x": 2, "y": 1}}' --header content-type:application/json > /tmp/test.out
asserteq '{"id": [0-9]+}'

curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "2999-01-01T00:00:00", "location": {"x": 3, "y": 1}}' --header content-type:application/json > /tmp/test.out
asserteq '{"id": [0-9]+}'

curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "2999-02-01T00:00:00", "location": {"x": 4, "y": 1}}' --header content-type:application/json > /tmp/test.out
asserteq '{"id": [0-9]+}'

echo 'Testing PUT to update an existing listing.'
curl -s localhost:9090/api/listings/3 -X PUT --data-binary '{"user": "nmlorg", "title": "My title", "description": "My UPDATED description", "expiration": "2999-01-01T00:00:00", "location": {"x": 3, "y": 1}}' --header content-type:application/json > /tmp/test.out
asserteq '{"id": 3}'

curl -s localhost:9090/api/listings/3 > /tmp/test.out
asserteq '{"description": "My UPDATED description", "expiration": "2999-01-01T00:00:00", "id": 3, "location": {"x": 3.0, "y": 1.0}, "title": "My title", "user": "nmlorg"}'

echo 'Testing DELETE to remove an existing listing.'
curl -s localhost:9090/api/listings/3 -X DELETE > /tmp/test.out
asserteq ''

curl -s localhost:9090/api/listings/3 > /tmp/test.out
asserteq ''

echo 'Testing PUT to re-add a previously deleted listing.'
curl -s localhost:9090/api/listings/3 -X PUT --data-binary '{"user": "nmlorg", "title": "My title", "description": "My NEWLY UPDATED description", "expiration": "2999-01-01T00:00:00", "location": {"x": 3, "y": 1}}' --header content-type:application/json > /tmp/test.out
asserteq '{"id": 3}'

curl -s localhost:9090/api/listings/3 > /tmp/test.out
asserteq '{"description": "My NEWLY UPDATED description", "expiration": "2999-01-01T00:00:00", "id": 3, "location": {"x": 3.0, "y": 1.0}, "title": "My title", "user": "nmlorg"}'

#echo 'Testing search-by-radius.'
#curl -s 'localhost:9090/api/listings?radius=.5&x=3.1&y=1.1' > /tmp/test.out
#asserteq '[{"description": "My NEWLY UPDATED description", "expiration": "2999-01-01T00:00:00", "id": 3, "location": {"x": 3.0, "y": 1.0}, "title": "My title", "user": "nmlorg"}]'

#curl -s 'localhost:9090/api/listings?radius=1.5&x=3.1&y=1.1' > /tmp/test.out
#asserteq '[{"description": "My description", "expiration": "1999-02-01T00:00:00", "id": 2, "location": {"x": 2.0, "y": 1.0}, "title": "My title", "user": "nmlorg"}, {"description": "My NEWLY UPDATED description", "expiration": "2999-01-01T00:00:00", "id": 3, "location": {"x": 3.0, "y": 1.0}, "title": "My title", "user": "nmlorg"}, {"description": "My description", "expiration": "2999-02-01T00:00:00", "id": 4, "location": {"x": 4.0, "y": 1.0}, "title": "My title", "user": "nmlorg"}]'

echo 'Testing adding a comment to an existing listing.'
curl -s localhost:9090/api/listings/3/comments > /tmp/test.out
asserteq '[]'

curl -s localhost:9090/api/listings/3/comments --data-binary '{"user": "nmlorg", "comment": "This place is great!"}' --header content-type:application/json > /tmp/test.out
asserteq '{"id": [0-9]+}'

sleep 1

curl -s localhost:9090/api/listings/3/comments > /tmp/test.out
asserteq '[{"comment": "This place is great!", "id": 1, "user": "nmlorg"}]'

echo 'Testing that deleting a listing and re-adding it clears its comments.'
curl -s localhost:9090/api/listings/3 -X DELETE > /tmp/test.out
asserteq ''

sleep 1

curl -s localhost:9090/api/listings/3 -X PUT --data-binary '{"user": "nmlorg", "title": "My title", "description": "My RE-RE-UPDATED description", "expiration": "2999-01-01T00:00:00", "location": {"x": 3, "y": 1}}' --header content-type:application/json > /tmp/test.out
asserteq '{"id": 3}'

curl -s localhost:9090/api/listings/3/comments > /tmp/test.out
asserteq '[]'

sleep 1

echo 'Testing mass-delete.'
curl -s localhost:9090/api/listings -X DELETE > /tmp/test.out
asserteq ''

sleep 1

curl -s localhost:9090/api/listings > /tmp/test.out
asserteq '[]'
