
class ServerlessPlugin {
  constructor (serverless, options) {
    this.serverless = serverless
    this.options = options

    this.hooks = {
      'before:package:finalize': this.createResources.bind(this)
    }
  }

  /**
   * Adding resources
   */
  createResources () {
    const tablesConfig = this.serverless.service.custom.tables

    if (tablesConfig === undefined) {
      return
    }

    Object.keys(tablesConfig).forEach((tableKey) => {
      const tableConfig = tablesConfig[tableKey]

      if (!tableConfig.name) {
        return
      }

      const schema = {
        'Type': 'AWS::DynamoDB::Table',
        'Properties': {
          'TableName': tableConfig.name,
          'AttributeDefinitions': [],
          'KeySchema': [],
          'ProvisionedThroughput': {
            'ReadCapacityUnits': tableConfig.throughput && tableConfig.throughput.read ? tableConfig.throughput.read : 1,
            'WriteCapacityUnits': tableConfig.throughput && tableConfig.throughput.write ? tableConfig.throughput.write : 1
          }
        }
      }

      if (tableConfig.primaryKey) {
        schema.Properties.AttributeDefinitions.push({
          'AttributeName': tableConfig.primaryKey.name,
          'AttributeType': tableConfig.primaryKey.type || 'S'
        })
        schema.Properties.KeySchema.push({
          'AttributeName': tableConfig.primaryKey.name,
          'KeyType': 'HASH'
        })
      }

      if (tableConfig.rangeKey) {
        schema.Properties.AttributeDefinitions.push({
          'AttributeName': tableConfig.rangeKey.name,
          'AttributeType': tableConfig.rangeKey.type || 'S'
        })
        schema.Properties.KeySchema.push({
          'AttributeName': tableConfig.rangeKey.name,
          'KeyType': 'RANGE'
        })
      }

      if (tableConfig.ttl) {
        schema.Properties.TimeToLiveSpecification = {
          'AttributeName': tableConfig.ttl.attribute,
          'Enabled': tableConfig.ttl.enabled || true
        }
      }

      const CFKey = tableKey.charAt(0).toUpperCase() + tableKey.slice(1)
      this.serverless.service.provider.compiledCloudFormationTemplate.Resources[`Table${CFKey}`] = schema
    })

    this.updatePolicy()
  }

  /**
   * Update policy to use DynamoDB tables
   */
  updatePolicy () {
    if (this.serverless.service.custom.skipTablePolicy === true) {
      return
    }

    const tablesConfig = this.serverless.service.custom.tables

    const iamRole = this.serverless.service.provider.compiledCloudFormationTemplate.Resources['IamRoleLambdaExecution']
    if (iamRole === undefined) {
      return
    }

    const policy = iamRole.Properties.Policies[0]
    if (policy === undefined) {
      return
    }

    const resources = []
    Object.keys(tablesConfig).forEach((tableKey) => {
      const tableConfig = tablesConfig[tableKey]
      resources.push({
        // eslint-disable-next-line no-template-curly-in-string
        'Fn::Sub': 'arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/' + tableConfig.name
      })
    })

    policy.PolicyDocument.Statement.push({
      'Effect': 'Allow',
      'Action': [
        'dynamodb:*'
      ],
      'Resource': resources
    })
  }
}

module.exports = ServerlessPlugin
