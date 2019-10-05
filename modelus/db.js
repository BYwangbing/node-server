
// 数据库操作
var MongoClient = require('mongodb').MongoClient; //引入模块
var DbUrl = 'mongodb://127.0.0.1:27017/student';//连接数据库
var ObjectID = require('mongodb').ObjectId;
//暴露 ObjectID
exports.ObjectID=ObjectID;
// 定义全局变量
function __connectDb(callback) {
    MongoClient.connect(DbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) {
            console.log('数据库连接失败');
            return;
        }
        callback(db);
    })
}
/*
数据查找：
    var my_db = db.db('product');
    my_db.collection('').find().toArray(function (error, data) {

    })
* */
// 查找
exports.find = function (collectionName, json, callback) {
    __connectDb(function (db) {
        var my_db = db.db('student');
        var result = my_db.collection(collectionName).find(json);
        result.toArray(function (error, data) {
            if (error) {
                console.log('查找数据失败');
            }
            // console.log(data);
            callback(error, data);
            db.close();
        })
    })
};
// 增加
exports.insert = function (collectionName, json, callback) {
    __connectDb(function (db) {
        var my_db = db.db('student');
        my_db.collection(collectionName).insertOne(json, function (error,data) {
            // console.log(data);
            callback(error, data);
            db.close();
        })
    })
};
// 删除
exports.delete = function (collectionName, json, callback) {
    __connectDb(function (db) {
        var my_db = db.db('student');
        my_db.collection(collectionName).deleteOne(json, function (error,data) {
            // console.log(data);
            callback(error, data);
            db.close();
        })
    })
};
// 修改
exports.modify = function (collectionName, json_1, json_2, callback) {
    __connectDb(function (db) {
        var my_db = db.db('student');
        my_db.collection(collectionName).updateOne(json_1, {$set: json_2}, function (error,data) {
            // console.log(data);
            callback(error, data);
            db.close();
        })
    })
};
