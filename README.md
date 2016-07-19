# Settled CTO Tech Challenge -  Jay Johnston

##Requirements
* create a messaging system for Settled that will:
  * allow buyers and sellers to to message each other
  * allow buyers to book viewing requests with sellers
##Assumptions
* assumes one-to-one messaging is most likely use case (though model should support one to many recipients).
* more inbox reads than writes.
* system performance needs to feel instantaneous and scale easily
* 'eventual consistency' principle for updating inboxes is acceptable in order to preserve system performace (and less likely given prevalence of one-to-one messaging).  revisit if update time > 15s

##Design
###tech stack w/ pro's and con's
* infrastructure (AWS + docker + ECS)
   * 'all in' on AWS
   * Docker + ECS for container config and management
   * pro's:  AWS: probably the most sophisticated container management services, all services in one place reduces complexity. Docker: portability, reinfoces SOA design principles,
   * con's:  scheduling and scaling containers can be more complex than autoscaling VMs  (this will likely change at AWS over time)
* mongoDB
  * pros:  fast, open source, highly resilient, trivial to scale horizontally (sharding) sharding, consistent with existing tech choices, data model is easily extensible and adaptable, queries are simpler
  * cons: not optimal for reporting/ highly relational data, still maturing (compared to other open source RDBMS)
* node.js
  * pro's:  fast, open source, relatively widespread ann mature, scales well, javascript skills are widespread, consistent with existing stack
  * con's: async model can add complexity for concurrency (for fun and with a bit more time, i would take a hard look at Golang.  benefits include: statically typed, handles concurrency well, and very fast), skills command a premium (mostly concentrated in contractor space)
* angular.js
    * pro's: widely adpoted, well-supported, skills available in the market, consistent with existing tech stack
    * con's: resource intensive on the client side, v2 is still in RC stage and is not backwards compatible with V1

###application
* will use an 'inbox' model for each user
* UX is an important design consideration - how will messages vs. viewing requests be displayed could impact the data model (separate collections).  rapid prototyping with a beta customer group is recommended.
* angluar front end will talk to a node REST api as per prototype.
###database
* queries - (pseudocode in places)
  * find all messages / viewing requests for a given user inbox:  db.message.find({to: ObjectID(user.id)}) 
  * find all viewing requests for a property: db.viewing_request.find({ObjectID(property.id)})
  * find all messages from a given sender: db.message.find({from: ObjectID(user.id)}))
  * send new message: 
    * db.message.insert({username: username, first_name: first_name....})
    *for users in message.to, db.user.update ({_id: message.to}, $push:{messages: message.id})
  * send new viewing request: as above.

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
                                   │ │ │- messages, [ObjectID(message.id)]                    │   │         │ │                          │  │
                                   │ │ │- viewing_requests, [ObjectID(viewing_request.id)]  │ │   │         │ │                          │  │
                                   │ │ │- message_count, Int                                │ │   │         │ └──────────────────────────┘  │
                                   │ │ │                                                    │ │   │         │                               │
                                   │ │ └────────────────────────────────────────────────────┼─┘   │         └─────────────────┬─────┼───────┘
                                   │┌┘                                                      └─────┼─┐                         │              
                                   ││                                                             │ │                         │              
                                   └┼─────────────────────────────────────────────────────────────┘ │                         │              
                                    │                                                               │                         │              
                                    ○                                                               ○                         │              
                                   ╱│╲                                                          ╱│╲                       │              
                  ┌─────────────────────────────────────────────────────┐    ┌──────────────────────────────────────────┐     │              
                  │           ┌──────────────────────────┐              │    │         ┌─────────────────────┐          │     │              
                  │           │        db.message        │              │    │         │ db.viewing_request  │          │     │              
                  │           └──────────────────────────┘              │    │         └─────────────────────┘          │╲    │              
                  │   ┌─────────────────────────────────────────┐       │    │  ┌─────────────────────────────────────┐ │─○───┘              
                  │   │- _id                                    │       │    │  │- _id                                │ │╱                   
                  │   │- from, ObjectID(user.id)                │       │    │  │- property, ObjectID(property.id)    │ │                    
                  │   │- to, [ObjectID(user.id]                 │       │    │  │- requested_time, Date               │ │                    
                  │   │- message_body, String                   │       │    │  │- request_status, String (i.e.       │ │                    
                  │   │- time_created, DateTime                 │       │    │  │accepted, rejected, unscheduled)     │ │                    
                  │   │- status, String (i.e. read/unread)      │       │    │  │- viewing_notes,                     │ │                    
                  │   │                                         │       │    │  │    {   date_added: DateTime,        │ │                    
                  │   │                                         │       │    │  │        added_by: String,            │ │                    
                  │   └─────────────────────────────────────────┘       │    │  │        note: String   }             │ │                    
                  │                                                     │    │  └─────────────────────────────────────┘ │                    
                  └─────────────────────────────────────────────────────┘    └──────────────────────────────────────────┘                    
                                                                                                                                             
  
####implementation
  * collections:  db.User, db.Message and db.viewing_request.  User object stores an array of references to messages and viewing requests.
  * rationale: simple to implement, not a large number of messages or viewing_requests per user anticipated (100s max), messages and viewing_requests can be extended and queried separately. 
  * two writes per send could require optimising at a later stage (i.e. 100's of operations per second). probably some ways off and can be addressed with asynchronous workers.
  * indexes:
    * db.message|viewing_request.createIndex( {to: 1, from: 1, time_created: 1} )  // compound index allows faster sorting on sender, recipient and date
  * sharding: 
    * messages by user (will try to ensure faster reads by storing messages for a given user on the same shard)

###plan
* consider rapid prototype messaging feature in a [1 week Sprint](http://www.gv.com/sprint/). create a beta user group with some incentive to feedback.  
* based on sprint, implement v.1 prototype as simplest possible feature. start simple to get something into the hands of production users quickly. seek feedback 
* consider feature switching messaging functionality to be able to roll out gradually to segments of the total userbase (with fallback to email for those not in the pilot.)
* subsequent iterations:
  * threaded messages
  * attachments [pictures, video links]
  * push notifications
* consider [fan out on write pattern (with buckets)](http://blog.mongodb.org/post/65612078649/schema-design-for-social-inboxes-in-mongodb) for scaling that optimises for Reads.
* further scale can be achieved with an asynchronous service model like [Socialite](https://github.com/mongodb-labs/socialite)

#Prototype
* very simple CRUD implmentation for Users on Angular + Node + Express + Mongo + Docker
* hadn't had much chance to use Docker previously so enjoyed having a good play around (though i probably burnt too much time on this part of the task =).
* haven't written any tests! nor have i setup a build pipeline with gulp. would be the next job on my list (karma, mocha and should.js installed),  firing the tests on every build (and eventually every commit once hooked into Jenkins or similar). 
##Installation Instructions
1. clone this github repo into a local directory: https://github.com/shambolic/settled
2. run ./setup.sh
* assumes (and tries to download and install) Docker for Mac.  if you are installing from fresh you will need to:
3. enter su credentials
* NB:there are some known issues with Docker for Mac releasing ports.  if you enconter any pconflicts, they are  usually solved by restarting the servic.e 