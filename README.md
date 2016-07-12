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
  * create docker container w/ node/mongo./
  * add node app
  * 


(which dev to i trust most to review this? who is not at immerse.  Alec? is there a way i could ask Lucas? who 

##Requirements
create a messaging system for settled that will:

* allow buyers and sellers to to message each other
* allow buyers to book viewing requests with sellers
##Assumptions
* will be more reads than writes, as more people
* system performance needs to feel instantaneous and scale easily
* 'eventual consistency' principle for updating inboxes is acceptable in order to preserve system performace.  revisit if update time > 15s
* TBD: automated tests haven't been included as part of this example, but 
* single docker container has been used, would normally separate app server and db

##Design
###application
* will use an 'inbox' model for each user - one for messages and one for viewing requests.
* Viewing Requests inbox is only visible if you have listed a property
* angluar web app will talk to a node api

###tech stack w/ pro's and con's
* docker with Rancher for management
* mongoDB
  * pros:  fast, open source, highly resilient
  * cons: not optimised for reporting
* node.js
  * pro's:  fast, open source
  * con's: async model can add complexity for concurrency (with a bit more time, would )
* angular.js
    * pro's:
    * con's: 
    
###database design
* use a sharded mongodb in the 

#Installation Instructions
  1. clone this git repo into a local directory: 
2. run ./setup.sh
3. 