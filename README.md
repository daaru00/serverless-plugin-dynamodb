# Serverless DynamoDB

[![npm](https://img.shields.io/npm/v/serverless-plugin-dynamodb.svg)](https://www.npmjs.com/package/serverless-plugin-dynamodb)

A [serverless](https://serverless.com) plugin to easily create DynamoDB tables from configurations files. This plugin will also edit the Lambda Role to allow any operations on created tables.

## Usage

### Installation

```bash
$ npm install serverless-plugin-dynamodb --save-dev
```
or using yarn
```bash
$ yarn add serverless-plugin-dynamodb
```

### Configuration

```yaml
plugins:
  - serverless-plugin-dynamodb

custom:
  tables:
    todo:
      name: ${self:service}-${self:provider.stage}-ToDo # Table Name
      primaryKey: # Primary Key configurations,  default type: S
        name: id
        type: 'S'
      rangeKey: # Range Key configurations, optional, default type: S
        name: date
        type: 'S'
      throughput: # ProvisionedThroughput configuration, default: read 1 and write 1
        read: 1
        write: 1
```

## TTL

To add an TimeToLive specification on table resource set the `ttl` table configuration:
```yml
custom:
  tables:
    todo:
      name: ${self:service}-${self:provider.stage}-ToDo
      primaryKey:
        name: id
        type: 'S'
      ttl: 
        attribute: ttl
        enabled: true # Optional, true by default
```

## Policy

By default the plugin edit the common lambda function policy to allow any function to do any data operations
```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:*"
  ],
  "Resource": "<table resource>"
}
``` 
to disable this behaviour set the config `skipTablePolicy` to `true`
```yaml
custom:
  skipTablePolicy: true
```

## Resource names

Table resource will be create using the table configuratin key name in camel case prepending "Table" before the name,
for example:
```yml
custom:
  tables:
    todo:
      name: ${self:service}-${self:provider.stage}-ToDo
      primaryKey:
        name: id
        type: 'S'
```
will create a `AWS::DynamoDB::Table` resource with key name `TableTodo`, so you can reference it in this way:
```yml
iamRoleStatements:
  - Effect: Allow
    Action:
      - dynamodb:PutItem
    Resource: 
      - "Fn::GetAtt": ["TableTodo", "Arn"]
```

### TODO

- [x] Create tables
- [x] Automatic create IAM Role
- [x] Support TTL attributes
- [ ] Support Secondaries Index
- [ ] Support Global Secondaries Index
- [ ] Support triggers
