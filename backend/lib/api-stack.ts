import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, MockIntegration, Model, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaPowertoolsLayer } from 'cdk-aws-lambda-powertools-layer';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
  appName: string;
  envName: string;
}

export class ApiStack extends Stack {
  public restApiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    /**********
      Lambda Functions
     **********/

    // Lambda Powertools Layer
    const powertoolsLayer = new LambdaPowertoolsLayer(this, 'PowertoolsLayer', {
      version: '2.32.0',
      includeExtras: true,
    });

    const getAirportCode = new PythonFunction(this, 'GetAirportCode', {
      functionName: `${props.appName}-GetAirportCode-${props.envName}`,
      entry: 'src/get_airport_code',
      runtime: Runtime.PYTHON_3_10,
      architecture: Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(5),
      retryAttempts: 0,
      layers: [powertoolsLayer],
    });

    /**********
      Mock APIs
     **********/

    const restapi = new RestApi(this, 'RestApi', { restApiName: `${props.appName}-api-${props.envName}` });

    // GET /member/{memberNumber}

    const getMemberMockIntegration = new MockIntegration({
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json':
              '{"id": 2175107, "firstName": "Eric", "lastName": "Bach", "addressLine1": "123 Main St", "addressLine2": "Apt 101", "city": "Edmonton", "province": "AB", "postalCode": "T5T5T5", "creditCard":{"name":"Eric Bach","number":"4216*******0823","exiryDate":"06/28","type":"VISA"}}',
          },
        },
      ],
    });

    const getMember = restapi.root.addResource('member').addResource('{memberNumber}');

    getMember.addMethod('GET', getMemberMockIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': Model.EMPTY_MODEL,
          },
        },
      ],
    });

    // GET /rewards/balance/{memberId}

    const getRewardDollarBalanceMockIntegration = new MockIntegration({
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': '{"memberId": 2175107, "balance": 153.87}',
          },
        },
      ],
    });

    const getRewardDollarBalance = restapi.root.addResource('rewards').addResource('balance').addResource('{memberId}');

    getRewardDollarBalance.addMethod('GET', getRewardDollarBalanceMockIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': Model.EMPTY_MODEL,
          },
        },
      ],
    });

    // GET /airport/{city}

    const getAirportCodeLambdaIntegration = new LambdaIntegration(getAirportCode, {
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
    });

    const getAirportCodeResource = restapi.root.addResource('airport').addResource('{city}');
    getAirportCodeResource.addMethod('GET', getAirportCodeLambdaIntegration);

    // GET /flights/{departureId}/{arrivalId}/{date}

    const getAvailableFlightsMockIntegration = new MockIntegration({
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json':
              '[{"id":123,"flights":[{"id":"WS258","airline":"WestJet","departureid":"YEG","departureTime":"2024-03-31T23:00:00:00Z","arrivalId":"YYC","arrivalTime":"2024-03-31T23:45:00Z","price":234.24},{"id":"WS19","airline":"WestJet","departureid":"YYC","departureTime":"2024-04-01T03:19:00:00Z","arrivalId":"CDG","arrivalTime":"2024-04-01T11:12:00Z","price":383.19}]},{"id":346,"flights":[{"id":"WS239","airline":"WestJet","departureid":"YEG","departureTime":"2024-03-31T12:15:00:00Z","arrivalId":"YYC","arrivalTime":"2024-03-31T13:00:00Z","price":184.24},{"id":"WS19","airline":"WestJet","departureid":"YYC","departureTime":"2024-04-01T03:19:00:00Z","arrivalId":"CDG","arrivalTime":"2024-04-01T11:12:00Z","price":383.19}]}]',
          },
        },
      ],
    });

    const flightsResource = restapi.root.addResource('flights');
    const getAvailableFlights = flightsResource.addResource('{departureId}').addResource('{arrivalId}').addResource('{date}');

    getAvailableFlights.addMethod('GET', getAvailableFlightsMockIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': Model.EMPTY_MODEL,
          },
        },
      ],
    });

    // POST /flights/bookings

    const bookFlightMockIntegration = new MockIntegration({
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': '{"referenceNumber": "UJH35S"}',
          },
        },
      ],
    });

    const bookFlight = flightsResource.addResource('bookings');

    bookFlight.addMethod('POST', bookFlightMockIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': Model.EMPTY_MODEL,
          },
        },
      ],
    });

    /**********
     Outputs
     **********/

    this.restApiUrl = restapi.url;
  }
}
