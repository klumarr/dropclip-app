# DynamoDB IAM Policy Setup - Base policy uses StringEquals for key-based access control. Index policy provides unrestricted GSI queries. Combination enables both data access control and efficient querying.

This is the policy for the creative role that successfully fetches events for a creative.

[cloudshell-user@ip-10-130-0-70 ~]$ aws iam get-role-policy --role-name dropclip-creative-role --policy-name creative-base-policy | cat

{
"RoleName": "dropclip-creative-role",
"RoleName": "dropclip-creative-role",
"PolicyName": "creative-base-policy",
"PolicyDocument": {
"Version": "2012-10-17",
"Version": "2012-10-17",
"Statement": [
{
"Effect": "Allow",
"Action": [
"dynamodb:Query",
"dynamodb:Scan",
"dynamodb:GetItem",
"dynamodb:PutItem",
"dynamodb:UpdateItem",
"dynamodb:DeleteItem",
"dynamodb:BatchGetItem",
"dynamodb:BatchWriteItem"
],
"Resource": [
"arn:aws:dynamodb:*:*:table/dev-events",
"arn:aws:dynamodb:*:*:table/dev-events/index/CreativeIdIndex",
"arn:aws:dynamodb:*:*:table/dev-follows",
"arn:aws:dynamodb:*:*:table/dev-uploads", "arn:aws:dynamodb:*:*:table/dev-analytics"
],
"Condition": {
"StringEquals": {
"dynamodb:LeadingKeys": [
"${cognito-identity.amazonaws.com:sub}"
]
}
}
}
]
}
}
