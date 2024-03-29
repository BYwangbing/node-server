const db = require('../../modelus/db');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const xlsx = require('node-xlsx');
const session = require('express-session');
// const formidable = require('formidable'); //上传功能的插件
// 获取post
const multiparty = require('multiparty');  /*图片上传模块  即可以获取form表单的数据 也可以实现上传图片*/
//定义返回变量格式
var resData;
router.use(function (req, res, next) {
    resData = {
        code: 0,
        message: ''
    };
    next();
});

// 接收图片文件名字
var pictureFile

// 获取运营人员列表
router.get('/operateList', function (req, res, next) {
    db.find('operateUser', {}, function (error, data) {
        resData.code = 0;
        resData.message = '运营人员列表获取成功';
        resData.data = data;
        res.json(resData);
        return;
    })
})
// 添加运营人员
router.post('/addOperateUser', function (req, res, next) {
    var form = new multiparty.Form();
    form.uploadDir = 'upload';  //上传图片保存的地址     目录必须存在
    form.parse(req, function (err, fields, files) {
        // 获取提交的数据以及图片上传成功返回的图片信息
        /*获取表单的数据*/
        // console.log(fields);  
        /*图片上传成功返回的信息*/
        // console.log(files);  
        // console.log(files.operatePortrait[0].path);
        if (fields.operateName[0] === '') {
            resData.code = 1;
            resData.message = '请输入运营人员姓名';
            res.json(resData);
            return;
        }
        if (fields.operateContact[0] === '') {
            resData.code = 1;
            resData.message = '请输入运营人员联系方式';
            res.json(resData);
            return;
        }
        //邮箱号不能空
        const regEmail = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        if (fields.operateEmail[0] === '') {
            resData.code = 1;
            resData.message = '请输入运营人员邮箱号';
            res.json(resData);
            return;
        } else if (!regEmail.test(fields.operateEmail[0])) {
            resData.code = 1;
            resData.message = '邮箱格式不正确';
            res.json(resData); //使用res.json的方法返回前端数据
            return;
        }
        var arr = Object.getOwnPropertyNames(files);
        if (arr.length === 0) {
            resData.code = 1;
            resData.message = '请选择头像';
            res.json(resData);
            return;
        }
        var operateName = fields.operateName[0];
        var operateNumber = fields.operateNumber[0];
        var operateAge = fields.operateAge[0];
        var operateContact = fields.operateContact[0];
        var operateEmail = fields.operateEmail[0];
        var operateAddress = fields.operateAddress[0];
        var operateSex = fields.operateSex[0];
        var operatePortrait = files.operatePortrait[0].path;
        pictureFile = operatePortrait;
        db.insert('operateUser', {
            operateName,
            operateNumber,
            operateAge,
            operateContact,
            operateEmail,
            operateAddress,
            operateSex,
            operatePortrait
        }, function (error, data) {
            if (error) {
                resData.code = 1;
                resData.message = '运营人员添加失败';
                res.json(resData);
                return;
            } else {
                resData.code = 0;
                resData.message = '运营人员添加成功';
                resData.data = data;
                res.json(resData);
                return;
            }
        })
    })
})
// 删除运营人员
router.get('/deleteOperateUser', function (req, res) {
    const id = req.query.id;
    console.log(id)
    db.delete('operateUser', {
        '_id': new db.ObjectID(id),
    }, function (error, data) {
        if (!error) {
            console.log('-----------------------------------')
            const picture = pictureFile
            if (picture) {
                // 同时删除upload下的图片
                fs.unlink(picture, function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('文件:' + picture + ' 删除成功！');
                })
            }
            resData.code = 0;
            resData.message = '运营人员删除成功';
            resData.data = data;
            res.json(resData);
            return;
        } else {
            resData.code = 1;
            resData.message = '运营人员删除失败';
            res.json(resData);
            return;
        }
    })
});
// 获取修改运营人员信息
router.get('/modifyOperateUser', function (req, res) {
    const id = req.query.id;
    console.log(id)
    //去数据库查询这个id对应的数据
    db.find('operateUser', {
        _id: new db.ObjectID(id)
    }, function (error, data) {
        resData.code = 0;
        resData.data = data;
        res.json(resData);
    })
});
// 修改运营人员
router.post('/editOperateUser', function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir = 'upload';  //上传图片保存的地址     目录必须存在
    form.parse(req, function (err, fields, files) {
        console.log(fields);
        console.log(files);
        var _id = fields._id[0];   /*修改的条件*/
        var operateName = fields.operateName[0];
        var operateNumber = fields.operateNumber[0];
        var operateAge = fields.operateAge[0];
        var operateContact = fields.operateContact[0];
        var operateEmail = fields.operateEmail[0];
        var operateAddress = fields.operateAddress[0];
        var operateSex = fields.operateSex[0];
        var operatePortrait;
        var originalFilename;
        var arr = Object.getOwnPropertyNames(files);
        if (arr.length === 0) {
            operatePortrait = fields.operatePortrait[0];
        } else {
            operatePortrait = files.operatePortrait[0].path;
            originalFilename = files.operatePortrait[0].originalFilename;
            //删除替换前的运营人员头像
            console.log(_id);
            db.find('operateUser', {
                '_id': new db.ObjectID(_id),
            }, function (error, data) {
                if (error) {
                    throw error;
                }
                const result = data[0].operatePortrait;
                fs.unlink(result, function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('文件: ' + result + ' 删除成功！');
                })
            })
        }
        console.log('--------------------------------------')
        console.log(operatePortrait);
        console.log(originalFilename);
        console.log('--------------------------------------')

        var setData;
        if (originalFilename) { /*修改了图片*/
            setData = {
                operateName,
                operateNumber,
                operateAge,
                operateContact,
                operateEmail,
                operateAddress,
                operateSex,
                operatePortrait,
            }
        } else {
            setData = {
                operateName,
                operateNumber,
                operateAge,
                operateContact,
                operateEmail,
                operateAddress,
                operateSex,
            };
        }
        // console.log(setData);
        db.modify('operateUser', { "_id": new db.ObjectID(_id) }, setData, function (error, data) {
            if (error) {
                console.log('错误');
                resData.code = 1;
                resData.message = '修改失败';
                resData.data = data;
                res.json(resData);
                return;
            }
            console.log('修改数据: ' + " 成功");
            resData.code = 0;
            resData.message = '修改成功';
            resData.data = data;
            res.json(resData);
            return;
        })
    })
});
// 查找运营人员
router.post('/findOperateUser', function (req, res) {
    const keyword = req.body.keyword;
    const reg = new RegExp(keyword, 'i');//不区分大小写
    db.find('operateUser', {
        'operateName': { $regex: reg },
    }, function (error, data) {
        if (data.length > 0) {
            resData.code = 0;
            resData.message = '查找成功';
            resData.data = data;
            res.json(resData);
            return;
        } else {
            resData.code = 1;
            resData.message = '暂无该运营人员';
            res.json(resData);
            return;
        }
    })
});
//下载运营人员信息
router.get('/download', (req, res) => {
    db.find('operateUser', {}, (err, data) => {
        if (err) {
            res.send({
                code: 1,
                msg: '下载失败1'
            });
        }
        const DATA = [['编号', '姓名', '工号', '年龄', '联系方式', '性别', '邮箱', '地址', '头像地址']];
        data.forEach((infom) => {
            const Arr = [
                infom._id, infom.operateName, infom.operateNumber, infom.operateAge, infom.operateContact,
                infom.operateSex, infom.operateEmail,
                infom.operateAddress, infom.operatePortrait
            ];
            DATA.push(Arr)
        });
        const options = { '!cols': [{ wch: 25 }, { wch: 8 }, { wch: 14 }, { wch: 6 }, { wch: 13 }, { wch: 6 }, { wch: 21 }, { wch: 24 }, { wch: 50 }] };
        const buffer = xlsx.build([{ name: "所有用户信息表", data: DATA }], options);
        fs.writeFile('./upload/Excel.xlsx', buffer, (err) => {
            if (err) {
                console.log(err)
                res.send({
                    code: 1,
                    msg: '下载失败2'
                });
            } else {
                res.send({
                    code: 0,
                    file: 'http://' + req.headers.host + '/upload/Excel.xlsx'
                })
                console.log('写入文件成功');
            }
        });
    })
})
module.exports = router;             