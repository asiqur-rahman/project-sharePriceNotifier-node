const PORT = Number(process.env.PORT || 5432);
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const schedule = require('node-schedule');
const log = require('./log-to-file');
const { json } = require("express");
const fs = require('fs');
const path = require('path');

const apiKey="Gck30R2M7EyYYPR6z+/++w66R4ajjcNaoXwadgR2idk=";
const clientId="fde083ee-51b4-45ef-a6bf-6b8c2abf9438";
const senderId="8804445649528";
    
const auditLog =(logText,logFileName=false)=>{
  log(logText, logFileName==false?'log.log':logFileName+'.log');
}

app.get("/api/cronlog", async (req, res) => {
  try {
    const mainPath = path.join(__dirname, 'log.log');
    if (fs.existsSync(mainPath)) {
        res.download(mainPath)
    }else{
      return res.status(500).json({
        Result: 'No Log Found !'
      });
    }
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/smslog", async (req, res) => {
  try {
    const mainPath = path.join(__dirname, 'sms.log');
    if (fs.existsSync(mainPath)) {
        res.download(mainPath)
    }else{
      return res.status(500).json({
        Result: 'No Log Found !'
      });
    }
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/smsbalance", async (req, res) => {
  try {
    await axios.get(`https://api.smsq.global/api/v2/Balance?ApiKey=${apiKey}&ClientId=${clientId}`).then(function (response) {
      return res.status(500).json(response.data.Data[0]);
    })
    .catch(function (error) {
      return {Error:error};
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

const sharesForNotification=['FAREASTFIN','FUWANGFOOD','RELIANCE1','DESHBANDHU','NBL','RNSPIN','PRIMEBANK'];

const ammujiMobileNo = '8801968654048';
const abbujiMobileNo = '8801781400109';
var mobileNo="8801799089893";

async function sharePriceScraper(onlyList=false) {
  const url = "https://www.dsebd.org/latest_share_price_scroll_l.php";
  const shareArray = [];

  await axios(url).then((response) => {
    const html_data = response.data;
    const $ = cheerio.load(html_data);
    const selectedElem =
      "#RightBody > div.row > div.col-md-9.col-sm-9.col-xs-9.full-width-mobile > div.table-responsive.inner-scroll > table > tbody > tr";
    const keys = [
      "NO",
      "TRADING CODE",
      "LTP",
      "HIGH",
      "LOW",
      "CLOSEP",
      "YCP",
      "CHANGE",
      "TRADE",
      "VALUE",
      "VOLUME",
    ];

    $(selectedElem).each((parentIndex, parentElem) => {
      let keyIndex = 0;
      const coinDetails = {};
        $(parentElem)
          .children()
          .each((childId, childElem) => {
           
            var value = $(childElem).text();
            if (value) {
              // if(keyIndex!=9){
              //   value=value.replaceAll('\n','');
              //   coinDetails[keys[keyIndex]] = value.replaceAll('\t','');
              // }else{
              //   coinDetails[keys[keyIndex]]=0;
              // }
              if(onlyList){
                if(keyIndex==1){
                  value=value.replace(/\n/g,'');
                  coinDetails[keys[keyIndex]] = value.replace(/\t/g,'');
                }
              }else{
                value=value.replace(/\n/g,'');
                coinDetails[keys[keyIndex]] = value.replace(/\t/g,'');
              }
              keyIndex++;
            }
          });
          shareArray.push(coinDetails);
    });
  });
  auditLog('Scraping Called. Total Share:'+ shareArray.length);
  return shareArray;
}


app.get("/api/smsnum", async (req, res) => {
  try {
    return res.status(200).json({
      MobileNo:mobileNo,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/smsnum/my", async (req, res) => {
  try {
    mobileNo='8801799089893';
    return res.status(200).json({
      MobileNo:mobileNo,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/smsnum/abbuji", async (req, res) => {
  try {
    mobileNo=abbujiMobileNo;
    return res.status(200).json({
      MobileNo:mobileNo,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/smsnum/ammuji", async (req, res) => {
  try {
    mobileNo=ammujiMobileNo;
    return res.status(200).json({
      MobileNo:mobileNo,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/smsnum/set/:mobileNo", async (req, res) => {
  try {
    mobileNo =req.params.mobileNo;
    return res.status(200).json({
      MobileNo:req.params.mobileNo,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/shareall", async (req, res) => {
  try {
    const shares = await sharePriceScraper();
    return res.status(200).json({
      total:shares.length,
      shares: shares,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/selectedshare", async (req, res) => {
  try {
    const shares = await sharePriceScraper();
    var selectedShareList=[];
    shares.forEach(share => {
      if(sharesForNotification.includes(share['TRADING CODE'])){
        selectedShareList.push(share);
      }
    });
    return res.status(200).json({
      total:selectedShareList.length,
      shares: selectedShareList,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

const selectedShareListData = async ()=>{
  const shares = await sharePriceScraper();
  var selectedShareList=new Date().toLocaleString();
    var count=1;
    shares.forEach(share => {
      if(sharesForNotification.includes(share['TRADING CODE'])){
        selectedShareList+='\n';
        selectedShareList+=count++ +'.'+share['TRADING CODE']+'('+share['LTP']+','+share['HIGH']+','+share['LOW']+')';
      }
    });
  return selectedShareList;
}

app.get("/api/getshareprice", async (req, res) => {
  try {
    await selectedShareListData().then(result=>{
      return res.status(200).send(result);
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/getsharepricemsg", async (req, res) => {
  try {
    await selectedShareListData().then(async result=>{
      await sendSms(result).then(smsResult=>{
        return res.status(200).json({Share:result,SmsResult:smsResult});
      });
    });
    
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.get("/api/getsharenamelist", async (req, res) => {
  try {
    const shares = await sharePriceScraper(true);
    return res.status(200).json(shares);
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

async function sendSms(sms=false){
  if(sms && mobileNo.length > 10){
    const body ={
      SenderId: senderId,
      Is_Unicode: true,
      Is_Flash: true,
      SchedTime: null,
      GroupId: null,
      Message: sms,
      MobileNumbers: mobileNo,
      ApiKey: apiKey,
      ClientId: clientId
    };
    await axios.post('https://api.smsq.global/api/v2/SendSMS',body).then(function (response) {
      auditLog('Sms Send Request (To - '+mobileNo+'). Request: '+ JSON.stringify(body),'sms');
      auditLog('Sms Send Response (To - '+mobileNo+'). Response: '+ JSON.stringify(response.data.Data),'sms');
      if(response.data.Data[0].MessageErrorCode=='1086'){
        auditLog('Sms Send Failed (To - '+mobileNo+'). Reason: '+ response.data.Data[0].MessageErrorDescription);
      }else{
        auditLog('Sms Send Success (To - '+mobileNo+'). MessageId: '+ response.data.Data[0].MessageId);
      }
      return {Response:response.data};
    })
    .catch(function (error) {
      auditLog('Sms Send Failed (To - '+mobileNo+'). Result:'+ error);
      return {error};
    });
    
  }else{
    return null;
  }
}
 
// dayOfWeek (0-6) Starting with Sunday
// 0-8/2 = 0,2,4,6,8
// */3 = Every 3 hour

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 4)];
rule.hour = [new schedule.Range(10, 14, 1)];
rule.minute = [30];
// rule.second = [new schedule.Range(0,59,1)];
rule.tz = this.timezone;//'Etc/UTC';

schedule.scheduleJob(rule, async function(){
  try {
    const shares = await sharePriceScraper();
    var selectedShareList=new Date().toLocaleString();
    var count=1;
    shares.forEach(share => {
      if(sharesForNotification.includes(share['TRADING CODE'])){
        selectedShareList+='\n';
        selectedShareList+=count++ +'.'+share['TRADING CODE']+'('+share['LTP']+','+share['HIGH']+','+share['LOW']+')';
      }
    });
    await sendSms(selectedShareList);
  } catch (err) {
    console.log(err);
  }
});

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

// schedule.scheduleJob('0 43 10-14 * * 0-4', function(){
//   if(dailySmsSend<=dailySmsLimit){
//     // sendSms();
//     dailySmsSend++;
//   }
//   console.log('Today is recognized by Rebecca Black! '+new Date().toLocaleString());
// });

app.listen(PORT, () =>{
  auditLog('Application Started');
  console.log(`The server is active and running on port ${PORT}`)
}
);