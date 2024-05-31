import { Injectable } from '@nestjs/common'
const cluster  = require('cluster')
import os from 'os'
import { cpus } from 'os'


const numberCPUs = cpus.length

console.log(numberCPUs)
@Injectable()
export class AppClusterService {

    static clusterize(callback: ()=> void):void {
      if(cluster.isPrimary) {

        const totalWoker = numberCPUs * cluster.worker
        
        console.log(
            `\x1b[36m ==> PORT:3000- PRIMARY [${process.pid}] <==\x1b[0m`,
          );
          console.log(`Primary ${process.pid} is running with ${totalWoker}`)
          for(let i = 0 ; i<numberCPUs;i++) {
            cluster.fork()
            cluster.fork()
          }
          cluster.on('exit',(worker) => {
            console.log(`Worker ${worker.process.pid} died`)
            cluster.fork()
          })
      } else {
        console.log(`\x1b[33m ==> CLUSTER START ON ${process.pid} <==\x1b[0m`);
        callback();
      }
          }
    }
