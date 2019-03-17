'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.tablesConfig = serverless.service.custom.tables;

    this.hooks = {
      'before:package:finalize': this.createResources.bind(this)
    };
  }

  /**
   * Adding resources
   */

  createResources () {
    if (this.tablesConfig === undefined || Array.isArray(this.tablesConfig) === false) {
      return;
    }

    this.tablesConfig.forEach((tableConfig) => {

      if (!tableConfig.name) {
        return;
      }

      const schema = {
        "Type": "AWS::DynamoDB::Table",
        "Properties": {
          "TableName": tableConfig.name,
          "AttributeDefinitions": [],
          "KeySchema": [],
          "ProvisionedThroughput": {
            "ReadCapacityUnits": tableConfig.throughput && tableConfig.throughput.read ? tableConfig.throughput.read : 1,
            "WriteCapacityUnits": tableConfig.throughput && tableConfig.throughput.write ? tableConfig.throughput.write : 1
          }
        }
      }

      if (tableConfig.primaryKey) {
        schema.Properties.AttributeDefinitions.push({
          "AttributeName": tableConfig.primaryKey.name,
          "AttributeType": tableConfig.primaryKey.type || 'S'
        })
        schema.Properties.KeySchema.push({
          "AttributeName": tableConfig.primaryKey.name,
          "KeyType": "HASH"
        })
      }

      if (tableConfig.rangeKey) {
        schema.Properties.AttributeDefinitions.push({
          "AttributeName": tableConfig.rangeKey.name,
          "AttributeType": tableConfig.rangeKey.type || 'S'
        })
        schema.Properties.KeySchema.push({
          "AttributeName": tableConfig.primaryKey.name,
          "KeyType": "RANGE"
        })
      }

      this.serverless.service.provider.compiledCloudFormationTemplate.Resources[`Table${tableConfig.name}`] = schema;
    });
  }

}

module.exports = ServerlessPlugin;
