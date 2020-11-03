const AWS = require("aws-sdk")

AWS.config.update({
    //endpoint: "http://localhost:8000"  if you want this project local(db from local)
    region: 'ap-southeast-1',
    accessKeyId: 'AKIAWAMW4NZRZOFO4SZK',
    secretAccessKey: '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'
})

const dynamoDB = new AWS.DynamoDB()
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'Sinhviensv3'

const params = {
    TableName: tableName,
    KeySchema: [
        { AttributeName: "mssv", KeyType: "HASH" } //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: "mssv", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
}

dynamoDB.createTable(params, (err, data) => {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
})

dynamoDB.listTables((e,d) => {
    console.log(d.TableNames)

 })

const paramsD = {
    TableName : tableName
}

// dynamoDB.deleteTable(paramsD,(e,d)=>{
//     console.log(d)
// })



const tablePromise = dynamoDB.listTables()
    .promise()
    .then((data) => {
        const exists = data.TableNames
            .filter(name => {
                return name === tableName;
            })
            .length > 0
        if (exists) {
            return Promise.reject('Table exists');
        }
        else {
            return dynamoDB.createTable(params).promise();
        }
    })

tablePromise.then((data) => {
    console.log(data)
}).catch((e) => {
    console.log(e)
})





const scanTable = async (tableName) => {
    const params = {
        TableName: tableName,
    };

    let scanResults = [];
    let items;
    do{
        items =  await docClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey != "undefined");

    return scanResults;
}

scanTable('Sinhviens').then((result)=> {
    console.log(result)
})


// dynamoDB.deleteItem({
//     "TableName": tableName, 
//     "Key" : {
//         "mssv": {'S':'Fred'}
//     }},(e,d) => {
//         console.log(e)
//         console.log(d)
//     })

module.exports = {
    dynamoDB,
    tableName,
    docClient
}





