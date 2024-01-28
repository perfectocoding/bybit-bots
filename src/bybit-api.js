const crypto = require('crypto');
const axios = require('axios');

class BybitApi {
    constructor(apiKey, apiSecret) {
        this.url = 'https://api.bybit.com';
        this.recvWindow = 5000;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    generateSignature(timestamp, parameters, secret){
        return crypto.createHmac('sha256', secret)
            .update(timestamp + this.apiKey + this.recvWindow + parameters)
            .digest('hex');
    }

    // see also:
    //   https://bybit-exchange.github.io/docs/v5/user/affiliate-info
    //   https://github.com/bybit-exchange/api-usage-examples/blob/master/V5_demo/api_demo/Encryption_HMAC.ts
    async getAffCustomerInfo(uid) {
        return this.getRequest('/v5/user/aff-customer-info', 'uid=' + uid);
    }

    async getRequest(endpoint, data) {
        const timestamp = Date.now().toString();
        const sign = this.generateSignature(timestamp, data, this.apiSecret);
        const fullEndpoint = this.url + endpoint + '?' + data;
        console.log('Обращение к API: ' + fullEndpoint);

        const headers = {
            'X-BAPI-SIGN-TYPE': '2',
            'X-BAPI-SIGN': sign,
            'X-BAPI-API-KEY': this.apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': this.recvWindow.toString()
        };

        const config = {
            method: 'GET',
            url: fullEndpoint,
            headers: headers,
        };

        console.log('Запрос к bybit API');
        return await axios(config);
    }
}

module.exports = BybitApi;