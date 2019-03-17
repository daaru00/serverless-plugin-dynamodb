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

### TODO

- [x] Create tables
- [x] Automatic create IAM Role
- [ ] Support Secondaries Index
- [ ] Support Global Secondaries Index
- [ ] Support triggers
