const uuid = require('uuid')
const express = require('express')
const path = require('path')
const hbs = require('hbs')
const { tableName, docClient,dynamoDB } = require('./crudaws')
const AWS = require("aws-sdk")
const multer = require('multer')


const app = express()

const port = process.env.PORT || 8000


const publicPath = path.join(__dirname, './public')
console.log(__dirname)

// const partials = path.join(__dirname,'./src/templates/partials')

app.use(express.static(publicPath))
app.use(express.json())

const s3 = new AWS.S3({
    region: 'ap-southeast-1',
    accessKeyId: 'AKIAWAMW4NZR3RSEGHP4',
    secretAccessKey: '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'

})

const storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, 'abcxyz')
        
    }
})

const upload = multer({storage}).single('image')

app.get('', function (req, res) {
    res.sendFile(publicPath + '/html/index.html', {})
})

app.get('/sinhvien', function (req, res) {
    const scanTable = async (tableName) => {
        const params = {
            TableName: tableName,
        };

        const scanResults = [];
        let items;
        do {
            items = await docClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey != "undefined");

        return scanResults;
    }

    scanTable(tableName).then((result) => {
        res.status(200).send(result)
    }).catch(e => {
        res.status(404).send({ 'sinhviens': [] })
    })
})


app.post('/sinhvien',upload, (req, resp) => {

    
    const myFile = req.file.originalname.split(".")
    const fileType = myFile[1]

    const param = {
        Bucket: 'bucket-testinghihi',
        Key: `${uuid.v4()}.${fileType}`,
        Body: req.file.buffer,
        ACL: 'public-read'
    }

    s3.upload(param, (error, data1) => {
        if(error){
           return res.status(500).send(error)
        }
        const params = {
            TableName: tableName,
            Item: {
                ...req.body,
                avatar : data1.Location,
            }
        }

        docClient.put(params, (err, data) => {
            if (err) {
                console.log(err.message)
                return resp.status(500).send(JSON.stringify(err, null, 2))
            } else {
                return resp.status(201).send({ ...req.body,avatar:data1.Location})
            }
        })
    })



    
})

app.delete('/sinhvien/:id', async (req, resp) => {
    const id = req.params.id

    const userId = await dynamoDB.getItem({
        TableName : tableName,
        Key: {
          'mssv': {'S': id}
        }
    }).promise()

    dynamoDB.deleteItem({
        "TableName": tableName,
        "Key": {
            "mssv": { 'S': id }
        }
    }, (e, d) => {
        if(e){
            resp.status(500).send({'error':'can not delete'})
        }else{
            resp.status(200).send({...userId.Item})
        }
    })

})


app.patch('/sinhvien/:id',(req,resp) => {
    console.log(req.params.id)
    const params = {
        TableName: tableName,
        Key: {
            "mssv": req.params.id
        },
        UpdateExpression: "SET hoten = :ht,email = :eml",
        ExpressionAttributeValues: {
            ":ht": req.body.hoten,
            ':eml' : req.body.email
        },
        ReturnValues: "UPDATED_NEW"
    }

    docClient.update(params, (err, data) => {
        if (err) {
            resp.status(500).send({'error':'can not update'})
        } else {
            resp.status(200).send({'mssv': req.params.id,'hoten' : req.body.hoten,'email':req.body.email })
        }
    })
})

app.listen(port, () => {
    console.log(`listen host ${port}`)
})