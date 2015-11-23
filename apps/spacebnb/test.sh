#!/bin/bash

function asserteq() {
  ACTUAL=$(cat test.out)
  EXPECTED=${1}
  if [ "${ACTUAL}" != "${EXPECTED}" ]; then
    echo "Assertion failed:"
    echo " Expected: \"${EXPECTED}\""
    echo "   Actual: \"${ACTUAL}\""
    exit 1
  fi
}


curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "1999-01-01T00:00:00", "location": {"x": 1, "y": 1}}' --header content-type:application/json > test.out
asserteq '{"id": 0}'

curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "1999-02-01T00:00:00", "location": {"x": 2, "y": 1}}' --header content-type:application/json > test.out
asserteq '{"id": 1}'

curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "2999-01-01T00:00:00", "location": {"x": 3, "y": 1}}' --header content-type:application/json > test.out
asserteq '{"id": 2}'

curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "2999-02-01T00:00:00", "location": {"x": 4, "y": 1}}' --header content-type:application/json > test.out
asserteq '{"id": 3}'

echo 'Testing PUT to update an existing listing.'
curl -s localhost:9090/api/listings/2 -X PUT --data-binary '{"user": "nmlorg", "title": "My title", "description": "My UPDATED description", "expiration": "2999-01-01T00:00:00", "location": {"x": 3, "y": 1}}' --header content-type:application/json > test.out
asserteq '{"id": 2}'

curl -s localhost:9090/api/listings/2 > test.out
asserteq '{"description": "My UPDATED description", "expiration": "2999-01-01T00:00:00", "id": 2, "location": {"x": 3, "y": 1}, "title": "My title", "user": "nmlorg"}'

echo 'Testing DELETE to remove an existing listing.'
curl -s localhost:9090/api/listings/2 -X DELETE > test.out
asserteq ''

curl -s localhost:9090/api/listings/2 > test.out
asserteq ''

echo 'Testing PUT to re-add a previously deleted listing.'
curl -s localhost:9090/api/listings/2 -X PUT --data-binary '{"user": "nmlorg", "title": "My title", "description": "My NEWLY UPDATED description", "expiration": "2999-01-01T00:00:00", "location": {"x": 3, "y": 1}}' --header content-type:application/json > test.out
asserteq '{"id": 2}'

curl -s localhost:9090/api/listings/2 > test.out
asserteq '{"description": "My NEWLY UPDATED description", "expiration": "2999-01-01T00:00:00", "id": 2, "location": {"x": 3, "y": 1}, "title": "My title", "user": "nmlorg"}'

echo 'Testing search-by-radius.'
curl -s 'localhost:9090/api/listings?radius=.5&x=3.1&y=1.1' > test.out
asserteq '[{"description": "My NEWLY UPDATED description", "expiration": "2999-01-01T00:00:00", "id": 2, "location": {"x": 3, "y": 1}, "title": "My title", "user": "nmlorg"}]'

curl -s 'localhost:9090/api/listings?radius=1.5&x=3.1&y=1.1' > test.out
asserteq '[{"description": "My description", "expiration": "1999-02-01T00:00:00", "id": 1, "location": {"x": 2, "y": 1}, "title": "My title", "user": "nmlorg"}, {"description": "My NEWLY UPDATED description", "expiration": "2999-01-01T00:00:00", "id": 2, "location": {"x": 3, "y": 1}, "title": "My title", "user": "nmlorg"}, {"description": "My description", "expiration": "2999-02-01T00:00:00", "id": 3, "location": {"x": 4, "y": 1}, "title": "My title", "user": "nmlorg"}]'

echo 'Testing adding a comment to an existing listing.'
curl -s localhost:9090/api/listings/2/comments > test.out
asserteq '[]'

curl -s localhost:9090/api/listings/2/comments --data-binary '{"user": "nmlorg", "comment": "This place is great!"}' --header content-type:application/json > test.out
asserteq '{"id": 0}'

curl -s localhost:9090/api/listings/2/comments > test.out
asserteq '[{"comment": "This place is great!", "id": 0, "user": "nmlorg"}]'

echo 'Testing that deleting a listing and re-adding it clears its comments.'
curl -s localhost:9090/api/listings/2 -X DELETE > test.out
asserteq ''

curl -s localhost:9090/api/listings/2 -X PUT --data-binary '{"user": "nmlorg", "title": "My title", "description": "My RE-RE-UPDATED description", "expiration": "2999-01-01T00:00:00", "location": {"x": 3, "y": 1}}' --header content-type:application/json > test.out
asserteq '{"id": 2}'

curl -s localhost:9090/api/listings/2/comments > test.out
asserteq '[]'

echo 'Bringing the number of listings up to 1000.'
for i in {4..1000}; do
  curl -s localhost:9090/api/listings --data-binary '{"user": "nmlorg", "title": "My title", "description": "My description", "expiration": "2999-03-01T00:00:00", "location": {"x": '${i}', "y": 1}}' --header content-type:application/json > test.out
  asserteq '{"id": '${i}'}'
done
