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
    if (this.tablesConfig === undefined) {
      return;
    }

    Object.keys(this.tablesConfig).forEach((tableKey) => {
      const tableConfig = this.tablesConfig[tableKey];

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
          "AttributeName": tableConfig.rangeKey.name,
          "KeyType": "RANGE"
        })
      }
      const CFKey = tableKey.charAt(0).toUpperCase() + tableKey.slice(1);
      this.serverless.service.provider.compiledCloudFormationTemplate.Resources[`Table${CFKey}`] = schema;
    });
  }

}

module.exports = ServerlessPlugin;
