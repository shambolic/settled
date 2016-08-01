# Settled CTO Tech Challenge -  Jay Johnston

##Requirements
* create a messaging system for Settled that will:
  * allow buyers and sellers to to message each other
  * allow buyers to book viewing requests with sellers
##Assumptions
* assumes one-to-one messaging is most likely use case (though model supports one to many recipients).
* implies more inbox reads than writes.
* system performance needs to feel instantaneous and scale easily
* 'eventual consistency' principle for updating inboxes is acceptable in order to preserve system performance (and less likely given prevalence of one-to-one messaging).  revisit if update time > 15s

##Design

###tech stack w/ pro's and con's
* infrastructure (AWS + docker + ECS)
   * 'all in' on AWS
   * Docker + ECS for container config and management
   * pro's:  
     *  AWS: the best cloud provider,  ECS is probably the most sophisticated container management services, all services in one place reduces complexity, credits for Startups - AWS Activate 
     * Docker: portability, reinforces SOA/microservices design principles, strong configuration management (version controlled).
   * con's:  scheduling and scaling containers can be more complex than autoscaling VMs  (this will likely change at AWS over time)
   * centralilsed logging using logstash/elastic
   * monitoring:  new relic for application performance, AWS cloud watch -> pager duty for alerting.
* mongoDB
  * pros:  fast, open source, highly resilient, trivial to scale horizontally (sharding), consistent with existing tech choices, data model is easily extensible and adaptable, queries are simpler
  * cons: not optimal for reporting/ highly relational data, still maturing (compared to other open source RDBMS)
* node.js
  * pro's:  fast, open source, relatively widespread and maturing (ES6 a big leap forward), scales well, javascript skills are widespread, consistent with existing stack, good build,  package management tools and testing tools (gulp, npm, karma, protractor)
  * con's: async model can add complexity for concurrency (for fun and with a bit more time, i would like to take a hard look at Golang.  benefits include: statically typed, handles concurrency well, and very fast), skills command a premium (mostly concentrated in contractor space)
* angular.js
    * pro's: widely adopted, well-supported, skills available in the market, consistent with existing tech stack, good profiling and debugging tools
    * con's: resource intensive on the client side, v2 is still in RC stage and is not backwards compatible with V1

###application
* angluar front end will talking to a node/express REST api as per prototype.
* will use an 'inbox' model for each user though UX for organising messages TBD.
* UX is an important design consideration - how will messages vs. viewing requests be displayed could impact the data model (separate collections).  
* rapid prototyping with a beta customer group is recommended.
###database
* key queries - (pseudocode in places). in order of anticipated frequency:
  * find all messages / viewing_requests for a given user:  db.message.find({to: ObjectID(user.id)}) 
  * find all viewing requests for a property: db.viewing_request.find({ObjectID(property.id)})
  * send new message: 
    * db.message.insert({username: username, first_name: first_name....})
    *for users in message.to, db.user.update ({_id: message.to}, $push:{messages: message.id})
  * send new viewing request: as above.
  * find all messages from a given sender: db.message.find({from: ObjectID(user.id)}))
  

####schema
                                                                                                                                             
                                   ┌──────────────────────────────────────────────────────────────┐                                          
                                   │                           ┌────────┐                         │                                          
                                   │                           │db.user │                         │                                          
                                   │                           └────────┘                         │                                          
                                   │   ┌──────────────────────────────────────────────────────┐   │                                          
                                   │   │- _id                                                 │   │                                          
                                   │   │- username, String                                    │   │         ┌───────────────────────────────┐
                                   │   │- password, String                                    │   │         │       ┌────────────────┐      │
                                   │   │- first_name, String                                  │   │         │       │  db.Property   │      │
                                   │   │- last_name, String                                   │   │         │       └────────────────┘      │
                                   │   │- date_created, DateTime                              │   │         │ ┌──────────────────────────┐  │
                                   │   │- user_status, Boolean                                │   │         │ │- id                      │  │
                                   │   │- email_address, String                               │   │         │ │- ....                    │  │
                                   │ │ │- message_count, Int                                  │   │         │ │                          │  │
                                   │ │ │- view_request_count, Int                           │ │   │         │ │                          │  │
                                   │ │ │                                                    │ │   │         │ └──────────────────────────┘  │
                                   │ │ │                                                    │ │   │         │                               │
                                   │ │ └────────────────────────────────────────────────────┼─┘   │         └─────────────────┬─────┼───────┘
                                   │┌┘                                                      └─────┼─┐                         │              
                                   ││                                                             │ │                         │              
                                   └┼─────────────────────────────────────────────────────────────┘ │                         │              
                                    │                                                               │                         │              
                                    ○                                                               ○                         │              
                                   ╱│╲                                                             ╱│╲                        │              
                  ┌─────────────────────────────────────────────────────┐    ┌──────────────────────────────────────────┐     │              
                  │           ┌──────────────────────────┐              │    │         ┌─────────────────────┐          │     │              
                  │           │        db.message        │              │    │         │ db.viewing_request  │          │     │              
                  │           └──────────────────────────┘              │    │         └─────────────────────┘          │╲    │              
                  │   ┌─────────────────────────────────────────┐       │    │  ┌─────────────────────────────────────┐ │─○───┘              
                  │   │- _id                                    │       │    │  │- _id                                │ │╱                   
                  │   │- from, ObjectID(user.id)                │       │    │  │- requestor, ObjectId(user.id)       │ │                    
                  │   │- to, [ObjectID(user.id]                 │       │    │  │- property, ObjectID(property.id)    │ │                    
                  │   │- message_body, String                   │       │    │  │- requested_time, Date               │ │                    
                  │   │- time_created, DateTime                 │       │    │  │- request_status, String (i.e.       │ │                    
                  │   │- status, String (i.e. read/unread)      │       │    │  │accepted, rejected, unscheduled)     │ │                    
                  │   │                                         │       │    │  │- viewing_notes,                     │ │                    
                  │   │                                         │       │    │  │    {   date_added: DateTime,        │ │                    
                  │   └─────────────────────────────────────────┘       │    │  │        added_by: String,            │ │                    
                  │                                                     │    │  └─────────────────────────────────────┘ │                    
                  └─────────────────────────────────────────────────────┘    └──────────────────────────────────────────┘                    
                                                                                                                                             
  
####implementation
  * collections:  db.User, db.Message and db.viewing_request, db.property.  users, messages and viewing_requests are linked.
  * two writes per send could require optimising at a later stage (i.e. 100's of operations per second). probably some ways off and can be addressed with asynchronous workers.
  * indexes:
    * compound indexes for: db.message & viewing_request.createIndex( {to: 1, from: 1, time_created: 1} )  // compound index allows faster sorting on sender, recipient and date
  * sharding: 
    * shard key: sh.shardCollection.("settled.message", {from : 1})  - will try to ensure faster reads by storing messages for a given user on the same shard, 
    * hash-based
  * benchmarking: ideally load tests should be run against a large dummy data set in a few different considerations using something like jMeter to validate the design principles
  * use AWS Cloud Manager for deployment, backup and scaling mongoDB
  

###plan
* consider rapid prototype messaging feature in a [1 week Sprint](http://www.gv.com/sprint/). create a beta user group with some incentive to feedback.  
* based on sprint, implement v.1 prototype as simplest possible feature. start simple to get something into the hands of production users quickly. seek feedback 
* consider feature switching messaging functionality to be able to roll out gradually to segments of the total userbase (with fallback to email for those not in the pilot.)
* subsequent iterations:
  * threaded messages
  * attachments [pictures, video links]
  * push notifications
  * etc...
* consider [fan out on write pattern (with buckets)](http://blog.mongodb.org/post/65612078649/schema-design-for-social-inboxes-in-mongodb) for scaling that optimises for Reads.
* further scale can be achieved with an asynchronous service model like [Socialite](https://github.com/mongodb-labs/socialite)
* remember [Gall's Law](https://en.wikipedia.org/wiki/John_Gall_(author)#Gall.27s_law):  a working complex system has always evolved from a working simple system. i.e. don't make your initial designs too complicated.

#Prototype
* very simple CRUD implementation for Users on Angular + Node + Express + Mongo + Docker
* hadn't had much chance to use Docker previously so enjoyed having a good play around (though i probably burnt too much time on this part of the task =).
* haven't written any tests! nor have i setup a build pipeline with gulp. would be the next job on my list (karma, mocha and should.js installed),  firing the tests on every build (and eventually every commit once hooked into Jenkins or similar). 

##Installation Instructions

1. clone this github repo into a local directory: https://github.com/shambolic/settled
2. run ./setup.sh
  * assumes (and tries to download and install) Docker for Mac.  if you are installing from fresh you will need to:
3. enter su credentials
  * NB:there are some known issues with Docker for Mac releasing ports.  if you encounter any conflicts, they are  usually solved by restarting the service 