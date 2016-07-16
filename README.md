# Settled CTO Tech Challenge -  Jay Johnston
##Plan
* outline requirements
* assumptions

* design
  * database principles and schema
  * application
  * tech stack - with pro's and con's
    * go back end
    * angular front end
    * docker container

* prototype
~~  * create docker container w/ node/mongo./ ~~
~~  * add node app ~~

* create schema in mongo
* create api endpoints (get, put)
* hook up front end (angular?)
* package (bash script to install docker, run files.)
 


(which dev to i trust most to review this? who is not at immerse.  Alec? is there a way i could ask Lucas? who 

##Requirements
create a messaging system for settled that will:

* allow buyers and sellers to to message each other
* allow buyers to book viewing requests with sellers
##Assumptions
* there will be more inbox reads than writes
* system performance needs to feel instantaneous and scale easily
* 'eventual consistency' principle for updating inboxes is acceptable in order to preserve system performace.  revisit if update time > 15s
* TBD: automated tests haven't been included as part of this example, but 


##Design
###tech stack w/ pro's and con's
* docker
   * all in on AWS ECS
   * pro's:  portability, reinfoces SOA design principles
   * con's: added complexity around scheduling containers   
* mongoDB
  * pros:  fast, open source, highly resilient, trivial to scale horizontally
  * cons: not optimised for reporting
* node.js
  * pro's:  fast, open source
  * con's: async model can add complexity for concurrency (with a bit more time, would )
* angular.js
    * pro's: widely adpoted, well supported.
    * con's: resource intensive on the client side

###database
* schema's

* sharded collection for scale
* *fan-out on write with buckets* pattern to ensure efficient inbox reads (see assumptions).  this shards the messages collection based on the recipient, which means messages in a common inbox will be on the same shard, and therefore more efficiently read, but writes will be across different shards to update a recipient's  inbox.  
* there is a trade-off on size, since a copy is stored per recipient.   
* *with buckets* pattern groups messages into single documents reducing the number of reads required to render the inbox  
* option to asynchronously save messages to recipients using worker processes. values performance over speed of update (see assumptions)
* indexing...
* 


###application
* will use an 'inbox' model for each user - one for messages and one for viewing requests.
* Viewing Requests inbox is only visible if you have listed a property
* angluar web app will talk to a node api



###resources
<!-- https://codeforgeek.com/2015/08/restful-api-node-mongodb/ -->

#Installation Instructions
1. clone this git repo into a local directory: 
2. run ./setup.sh
3. 