# Ecommerce

This micro service app is bootstap with 
<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>
 as a monorepo app

 It has four different service
 - User
 - Order
 - Payment
 - Product

 All service include a sample.env file for server dependency including a global sample.env for global app dependency

 ## Local Installation
 To run the app locally, ensure rabbitmq is installed
 
 Copy sample.env to env

Install dependency 

 `npm i`

 Start the each service with

 `npx nx serve [service]`

 
## Install with Docker

Copy sample.env to .env

Run docker compose

The four service should run on expose ports
 
 ## Documentation

 Find the documentation /api/v1/user/docs