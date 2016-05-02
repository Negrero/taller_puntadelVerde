/**
 * Created by negrero on 28/12/2015.
 */
var async = require('async')
var moment = require('moment')

module.exports = function (Tacho) {


    Tacho.getChartTimelineDrivers=function(ctx,query) {
        var db=Tacho.getDataSource().connector.collection(Tacho.modelName)
        var query_item=querys.timelineDriver
        var query_group=querys.timelineGroupDriver
        var query_vehicleUsed=querys.timelineVehicleUsed
        var query_place=querys.timelinePlaceDriver
        var groups = ([
            {id: 'activitys', content: "activitys"
                ,subgroupOrder:function (a,b){
                return a.subgroupOrder - b.subgroupOrder;
            }},
            {id: 'vehicles', content: 'Vehicle used'},
            {id: 'places', content: 'Places'}

        ]);

        var dateFocus = moment(query.dateFocus)
        var month = dateFocus.get('month')
        var year = dateFocus.get('year')
        var daysOfmonth = new Date(year, month + 1, 0).getDate()
        var start = moment([year, month, 1])
        var end = moment([year, month, daysOfmonth])
        var numbers = []
        query_item[0].$match.organizationId=query.organizationId
        query_item[0].$match.$and=[{  date:{$gte:start.toDate(),$lte:end.toDate()}}]

        query.cardnumbers.forEach(function (e, i, a) {
            numbers.push(new RegExp(e))
        })

        query_item[0].$match.cardNumber={$in: numbers}
        query_group[0]=query_item[0]
        query_vehicleUsed[0]=query_item[0]
        query_place[0]=query_item[0]
        var unknow=[]
        async.parallel([
            function(callback){
                db.aggregate(query_item,function(err,cursor){
                    if(err){
                        callback(err)
                    }else{
                        var m,minutes,hours,str
                        for(var i=0;i<cursor.length;i++) {
                            cursor[i].id =cursor[i].group+"a-"+i
                            if (cursor[i].end == null) {
                                cursor[i].end = cursor[i].start
                                //cursor[i].end = from.format("YYYY-M-D") + "T23:59:59.999Z"
                            }else{
                                m=moment(cursor[i].end).diff(moment(cursor[i].start),'minute')
                                minutes=m%60
                                hours= (m-(m%60))/60
                                cursor[i].content = (hours > 0) ?hours+" H "+minutes+" m":minutes+" m"

                            }
                        }
                        callback(null,cursor)
                    }
                });
            },
            function(callback){
                db.aggregate(query_group,
                    function(err,cursor){
                        if(err){
                            callback(err)
                        }else{
                            callback(null,cursor)
                        }
                })
            },function(callback){
                db.aggregate(query_vehicleUsed,function(err,cursor){
                    if(err){
                        callback(err)
                    }else{
                        var m,minutes,hours
                        for(var i=0;i<cursor.length;i++) {
                            cursor[i].id =cursor[i].group+"v-"+i
                            if (cursor[i].end == null) {
                                cursor[i].end = cursor[i].start
                                //cursor[i].end = from.format("YYYY-M-D") + "T23:59:59.999Z"
                            }else{
                                m=moment(cursor[i].end).diff(moment(cursor[i].start),'minute')
                                minutes=m%60
                                hours= (m-(m%60))/60
                                cursor[i].content +=(hours > 0) ?hours+"' "+minutes+"''</i>":minutes+"''</i>"
                                cursor[i].content += "&nbsp;&nbsp<i class='fa fa-road'> "+cursor[i].distance + " Km</i>"

                            }
                        }
                        callback(null,cursor)
                    }
                });
            },function(callback){
                db.aggregate(query_place,function(err,cursor){

                    if(err){
                        callback(err)
                    }else{
                        cursor.forEach(function(e){
                            e.content= e.fromTo+'<br><img class="flag flag-'+getCodeAlfaNation(e.content)+'" src="styles/img/blank.gif" alt="'+ e.content+'">'
                        })

                        callback(null,cursor)
                    }
                });
            }
        ],function(err,results){
            if(err){
                ctx.res.status(500).send(err)
            }else{
                var item=results[0].concat(results[2]).concat(results[3]).concat(unknow)
                var obj={
                    groups: results[1],
                    item:item
                }
                ctx.res.send(JSON.stringify(obj))
            }

        })

    }


    Tacho.remoteMethod(
        'getChartTimelineDrivers',
        {
            description:'Get data for Chart Time Line',
            accepts:[
                {arg:'ctx',type:'object',http:{ source: 'context'}},
                {arg:'query',type:'object', required: true, http:{source:'query'}}
            ],
            returns:{
                arg:'datachart', type: 'object', root:true
            },
            http:{verb:'get'}
        }
    );

  var querys = {
    timelineDriver: [
      {$match: {
        "organizationId": "",
        $and: "",
        cardNumber: ""
      }},
      {$unwind: "$activityChangeInfo"},
      {$project: {
        "start": "$activityChangeInfo.fromTime",
        "end": "$activityChangeInfo.toTime",
        "group" : "$cardNumber",
        "subgroup": {
          "$cond": {
            "if": {
              "$eq": [
                "$activityChangeInfo.slot",
                "conductor"
              ]
            },
            "then": "conductor",
            "else": "segundo conductor"
          }
        },
        "className": {
          "$cond": {
            "if": {
              "$eq": [
                "$activityChangeInfo.driverSystem",
                "PAUSA/DESCANSO"
              ]
            },
            "then": "rest-color",
            "else": {
              "$cond": {
                "if": {
                  "$eq": [
                    "$activityChangeInfo.driverSystem",
                    "CONDUCCIÓN"
                  ]
                },
                "then": "driving-color",
                "else": {
                  "$cond": {
                    "if": {
                      "$eq": [
                        "$activityChangeInfo.driverSystem",
                        "TRABAJO"
                      ]
                    },
                    "then": "working-color",
                    "else": "disponibility-color"
                  }
                }
              }
            }
          }
        },
        "type":{"$concat":["range"]},
        "content":{"$concat":["<i class='fa fa-clock-o'>&nbsp;&nbsp;"]},
        "title": {
          "$concat": [
            "<p><strong>Type: </strong>",
            "$activityChangeInfo.type",
            "<br>",
            "<strong>slot:</strong> ",
            "$activityChangeInfo.slot",
            "<br>",
            "<strong>driver system:</strong> ",
            "$activityChangeInfo.driverSystem",
            "<br>",
            "<strong> from Time:</strong> ",
            {$dateToString: {format: "%Y-%m-%dT%H:%M:%S", date: "$activityChangeInfo.fromTime"}},
            "<br>",
            "<strong>to Time:</strong> ",
            {$dateToString: {format: "%Y-%m-%dT%H:%M:%S", date: "$activityChangeInfo.toTime"}},
            "<br>"]

        }
      }},
      {$sort: {"start" : 1 }}
    ],
    timelineGroupDriver: [
      {$match: {
        "organizationId": "",
        $and: "",
        cardNumber: ""
      }},
      {$group: {"_id": "$cardNumber"}},
      {$lookup: {
        "from": "Driver",
        "localField": "_id",
        "foreignField": "cardNumber.number",
        "as": "driver"
      }},
      {$unwind: "$driver"},
      {$project: {
        "id": "$_id",
        "content": "$driver.name"
      }
      }

    ],
    timelineVehicleUsed:[
      {$match: {
        "organizationId": "",
        $and: "",
        cardNumber: ""
      }},
      {$unwind: "$vehicles"},
      {$project: {
        "start": "$vehicles.fromDate",
        "end": "$vehicles.toDate",
        "group": "$cardNumber",
        "subgroup": "$registration",
        "distance": "$distance",
        "content": {$concat: ["<i class='fa fa-truck'>&nbsp;&nbsp;", "$registration","</i>", "&nbsp;&nbsp;<i class='fa fa-clock-o'>&nbsp;&nbsp;"]},
        "title": {$concat: ["Vehicle"]},
        "style":{"$concat":["background:#2f89c3; border-style: groove"]},
        "type":{"$concat":["range"]}
      }
      },
      {$sort: {"start": 1}}
    ],
    timelinePlaceDriver: [
      {$match: {
        "organizationId": "",
        $and: "",
        cardNumber: ""
      }},
      {$unwind: "$places"},
      {
        $group:{
          "_id": "$_id",
          "array1":{$push:{"from" : "$places.fromDate",
            "group":"$cardNumber",
            "place":"$places.placeBegin",
            "region":"$places.placeReginBegin",
            "fromTo":{$concat:["Begin"]}
          }},
          "array2":{$push:{"from" : "$places.toDate",
            "group":"$cardNumber",
            "place":"$places.placeEnd",
            "region":"$places.placeReginEnd",
            "fromTo":{$concat:["End"]}
          }}

        }
      },
      {$project:{
        "_id": "$_id",
        "array":{$concatArrays:["$array1","$array2"]}
      }},
      {$unwind:"$array"},
      {$project:{
        "start": "$array.from",
        "group" : "$array.group",
        "subgroup": {$concat:["place"]},
        "type":{"$concat":["box"]},
        "style":{"$concat":["background:transparent"]},
        "fromTo":"$array.fromTo",
        "content": "$array.place",
        "title": {
          "$concat": [
            "<strong> Date Time:</strong><br>",
            {$dateToString: {format: "%Y-%m-%dT%H:%M:%S", date: "$array.from"}},
            "<strong> Region:</strong><br>",
            "$array.region"
          ]

        }
      }},
      {$match:{
        "start":{ $not:  { $type:  "null"  }  },
        "group":{ $not:  { $type:  "null"  }  }
      }}
    ],

    timelineVehicle: [
      {$match: {
        "organizationId": "",
        $and: "",
        registration: ""
      }},
      {$unwind: "$activityChangeInfo"},
      {$project: {

        "start": "$activityChangeInfo.fromTime",
        "end": "$activityChangeInfo.toTime",
        "group" : "$registration",
        "subgroup": {
          "$cond": {
            "if": {
              "$eq": [
                "$activityChangeInfo.slot",
                "conductor"
              ]
            },
            "then": "conductor",
            "else": "segundo conductor"
          }
        },
        "className": {
          "$cond": {
            "if": {
              "$eq": [
                "$activityChangeInfo.driverSystem",
                "PAUSA/DESCANSO"
              ]
            },
            "then": "rest-color",
            "else": {
              "$cond": {
                "if": {
                  "$eq": [
                    "$activityChangeInfo.driverSystem",
                    "CONDUCCIÓN"
                  ]
                },
                "then": "driving-color",
                "else": {
                  "$cond": {
                    "if": {
                      "$eq": [
                        "$activityChangeInfo.driverSystem",
                        "TRABAJO"
                      ]
                    },
                    "then": "working-color",
                    "else": "disponibility-color"
                  }
                }
              }
            }
          }
        },
        "type":{"$concat":["range"]},
        "content":{"$concat":["<i class='fa fa-clock-o'>&nbsp;&nbsp;"]},
        "title": {
          "$concat": [
            "<p><strong>Type: </strong>",
            "$activityChangeInfo.type",
            "<br>",
            "<strong>slot:</strong> ",
            "$activityChangeInfo.slot",
            "<br>",
            "<strong>driver system:</strong> ",
            "$activityChangeInfo.driverSystem",
            "<br>",
            "<strong> from Time:</strong> ",
            {$dateToString: {format: "%Y-%m-%dT%H:%M:%S", date: "$activityChangeInfo.fromTime"}},
            "<br>",
            "<strong>to Time:</strong> ",
            {$dateToString: {format: "%Y-%m-%dT%H:%M:%S", date: "$activityChangeInfo.toTime"}},
            "<br>"]

        }
      }},
      {$sort: {"start" : 1 }}
    ],
    timelineGroupVehicle: [
      {$match: {
        "organizationId": "",
        $and: "",
        registration: ""
      }},
      {$group: {
        "_id":"$registration"
      }},
      {
        $project: {
          "id": "$_id",
          "content": "$_id"
        }
      }

    ],
    timelineDriverUsed:[
      {$match: {
        "organizationId": "",
        $and: "",
        registration: ""
      }},
      {$lookup:{
        "from": "Driver",
        "localField": "cardNumber",
        "foreignField": "cardNumber.number",
        "as": "driver"
      }},
      {$project: {
        "start": {$arrayElemAt:["$activityChangeInfo.fromTime",0]},
        "end": {$ifNull:[{$arrayElemAt:["$activityChangeInfo.toTime",-1]},
          {$arrayElemAt:["$activityChangeInfo.fromTime",-1]}]
        },
        "distance":"$distance",
        "group" : "$registration",
        "subgroup": {$concat:["driver"]},
        "type":{"$concat":["range"]},
        "style":{"$concat":["background:#2f89c3; border-style: groove"]},
        "content": {$concat: ["<i class='fa fa-user'>&nbsp;&nbsp;", {$arrayElemAt:["$driver.name",0]},"</i>", "&nbsp;&nbsp;<i class='fa fa-clock-o'>&nbsp;&nbsp;"]},
        //"content": {"$concat":["point"]},
        "title": {
          "$concat": [
            "<strong> Date Time:</strong><br>",
            "<br><strong> Region:</strong><br>"
          ]}
      }}
    ],
    timelinePlaceVehicle: [
      {$match: {
        "organizationId": "",
        $and: "",
        cardNumber: ""
      }},
      {$unwind: "$places"},
      {
        $group:{
          "_id": "$_id",
          "array1":{$push:{"from" : "$places.fromDate",
            "group":"$registration",
            "place":"$places.placeBegin",
            "region":"$places.placeReginBegin",
            "fromTo":{$concat:["Begin"]}
          }},
          "array2":{$push:{"from" : "$places.toDate",
            "group":"$registration",
            "place":"$places.placeEnd",
            "region":"$places.placeReginEnd",
            "fromTo":{$concat:["End"]}
          }}

        }
      },
      {$project:{
        "_id": "$_id",
        "array":{$concatArrays:["$array1","$array2"]}
      }},
      {$unwind:"$array"},
      {$project:{
        "start": "$array.from",
        "group" : "$array.group",
        "subgroup": {$concat:["place"]},
        "type":{"$concat":["box"]},
        "style":{"$concat":["background:transparent"]},
        "fromTo":"$array.fromTo",
        "content": "$array.place",
        "title": {
          "$concat": [
            "<strong> Date Time:</strong><br>",
            {$dateToString: {format: "%Y-%m-%dT%H:%M:%S", date: "$array.from"}},
            "<strong> Region:</strong><br>",
            "$array.region"
          ]

        }
      }},
      {$match:{
        "start":{ $not:  { $type:  "null"  }  },
        "group":{ $not:  { $type:  "null"  }  }
      }}
    ],

    timelineDriverInfraction: [
      {$match: {
        "organizationId": "",
        $and: "",
        cardNumber: ""
      }},
      {$unwind: "$activityChangeInfo"},
      {$project: {
        "start": "$activityChangeInfo.fromTime",
        "end": "$activityChangeInfo.toTime",
        "group" : {$concat:["activitys"]},
        "subgroup": {
          "$cond": {
            "if": {
              "$eq": [
                "$activityChangeInfo.slot",
                "conductor"
              ]
            },
            "then": "conductor",
            "else": "segundo conductor"
          }
        },
        "className": {
          "$cond": {
            "if": {
              "$eq": [
                "$activityChangeInfo.driverSystem",
                "PAUSA/DESCANSO"
              ]
            },
            "then": "rest-color",
            "else": {
              "$cond": {
                "if": {
                  "$eq": [
                    "$activityChangeInfo.driverSystem",
                    "CONDUCCIÓN"
                  ]
                },
                "then": "driving-color",
                "else": {
                  "$cond": {
                    "if": {
                      "$eq": [
                        "$activityChangeInfo.driverSystem",
                        "TRABAJO"
                      ]
                    },
                    "then": "working-color",
                    "else": "disponibility-color"
                  }
                }
              }
            }
          }
        },
        "type":{"$concat":["range"]},
        "content":{"$concat":["<i class='fa fa-clock-o'>&nbsp;&nbsp;"]},
        "title": {
          "$concat": [
            "<p><strong>Type: </strong>",
            "$activityChangeInfo.type",
            "<br>",
            "<strong>slot:</strong> ",
            "$activityChangeInfo.slot",
            "<br>",
            "<strong>driver system:</strong> ",
            "$activityChangeInfo.driverSystem",
            "<br>",
            "<strong> from Time:</strong> ",
            {$dateToString: {format: "%Y-%m-%dT%H:%M:%S", date: "$activityChangeInfo.fromTime"}},
            "<br>",
            "<strong>to Time:</strong> ",
            {$dateToString: {format: "%Y-%m-%dT%H:%M:%S", date: "$activityChangeInfo.toTime"}},
            "<br>"]

        }
      }},
      {$sort: {"start" : 1 }}
    ],
    listFilesDate:[
      {$match:{"organizationId":""}},
      {$sort:{"date":1}},
      {$unwind:"$files"},
      {$group:{
        "_id":"$files.name",
        "date":{$push:{"date":"$date"}}
      }},
      {$project:{
        "name":"$_id",
        "from":{ $arrayElemAt: [ "$date.date", 0 ] },
        "to":{ $arrayElemAt: [ "$date.date", -1 ] }
      }}
    ]
  }

  var getCodeAlfaNation=function (nation) {
    var str = ""
    nation=nation.substring(nation.length-5,nation.length)
    switch (nation) {
      case "(00)H":
        str = "No hay informaci�n disponible (00)H";
        break;
      case "(01)H":
        str = "at";
        break;
      case "(02)H":
        str = "al";
        break;
      case "(03)H":
        str = "ad";
        break;
      case "(04)H":
        str = "am";
        break;
      case "(05)H":
        str = "az"
        ;
        break;
      case "(06)H":
        str = "be"
        ;
        break;
      case "(07)H":
        str = "bg"
        ;
        break;
      case "(08)H":
        str = "ba"
        ;
        break;
      case "(09)H":
        str = "by"
        ;
        break;
      case "(0A)H":
        str = "ch"
        ;
        break;
      case "(0B)H":
        str = "cy"
        ;
        break;
      case "(0C)H":
        str = "cz"
        ;
        break;
      case "(0D)H":
        str = "de"
        ;
        break;
      case "(0E)H":
        str = "dk"
        ;
        break;
      case "(0F)H":
        str = "es"
        ;
        break;
      case "(10)H":
        str = "ee"
        ;
        break;
      case "(11)H":
        str = "fr"
        ;
        break;
      case "(12)H":
        str = "fi"
        ;
        break;
      case "(13)H":
        str = "li"
        ;
        break;
      case "(14)H":
        str = "fo"
        ;
        break;
      case "(15)H":
        str = "gb"
        ;
        break;
      case "(16)H":
        str = "ge"
        ;
        break;
      case "(17)H":
        str = "gr"
        ;
        break;
      case "(18)H,":
        str = "hu"
        ;
        break;
      case "(19)H":
        str = "hr"
        ;
        break;
      case "(1A)H":
        str = "it"
        ;
        break;
      case "(1B)H":
        str = "ie"
        ;
        break;
      case "(1C)H":
        str = "is"
        ;
      case "(1D)H":
        str = "kz"
        ;
        break;
      case "(1E)H":
        str = "lu"
        ;
        break;
      case "(1F)H":
        str = "lt"
        ;
        break;
      case "(20)H":
        str = "lv"
        ;
        break;
      case "(21)H":
        str = "mv"
        ;
        break;
      case "(22)H":
        str = "mc"
        ;
        break;
      case "(23)H":
        str = "md"
        ;
        break;
      case "(24)H":
        str = "mk"
        ;
        break;
      case "(25)H":
        str = "no"
        ;
        break;
      case "(26)H":
        str = "nl"
        ;
        break;
      case "(27)H":
        str = "pt"
        ;
        break;
      case "(28)H":
        str = "pl"
        ;
        break;
      case "(29)H":
        str = "ro"
        ;
        break;
      case "(2A)H":
        str = "sm"
        ;
        break;
      case "(2B)H":
        str = "ru"
        ;
        break;
      case "(2C)H":
        str = "se"
        ;
        break;
      case "(2D)H":
        str = "sk"
        ;
        break;
      case "(2E)H":
        str = "si"
        ;
        break;
      case "(2F)H":
        str = "tm"
        ;
        break;
      case "(30)H":
        str = "tr"
        ;
        break;
      case "(31)H":
        str = "ua"
        ;
        break;
      case "(32)H":
        str = "va"
        ;
        break;
      case "(33)H":
        str = "yu"
        ;
        break;
      case ".FC)H":
        str = "RFU (34..FC)H"
        ;
        break;
      case "(FD)H":
        str = "eu"
        ;
        break;
      case "(FE)H":
        str = "Resto de Europa"
        ;
        break;
      case "(FF)H":
        str = "Resto del mundo"
        ;
        break;
    }
    return str;
  }
}


