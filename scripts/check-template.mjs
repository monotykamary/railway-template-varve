import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const config=JSON.parse(readFileSync(resolve(root,'template.json'),'utf8'));
const entries=Object.entries(config.services);
assert.equal(entries.length,1);
assert.equal(Object.keys(config.buckets).length,1);
const [id,service]=entries[0];
assert.match(id,/^[0-9a-f-]{36}$/);
assert.equal(Object.values(config.buckets)[0].name,'objects');
assert.equal(service.name,'varve');
assert.equal(service.source.repo,'https://github.com/monotykamary/railway-template-varve');
assert.equal(service.source.rootDirectory,'/');
const version=JSON.parse(readFileSync(resolve(root,'VERSION.json'),'utf8'));
assert.equal(service.icon,`https://raw.githubusercontent.com/monotykamary/varve/${version.commit}/media/icon.png`);
assert.equal(service.deploy.healthcheckPath,'/ready');
assert.equal(service.deploy.healthcheckTimeout,120);
assert.equal(service.deploy.numReplicas,1);
assert.equal(service.deploy.sleepApplication,false);
assert.equal(service.deploy.overlapSeconds,0);
assert.equal(service.deploy.drainingSeconds,20);
assert.deepEqual(service.networking.serviceDomains,{'<hasDomain>:8080':{port:8080}});
assert.deepEqual(service.volumeMounts,{[id]:{mountPath:'/data',backupSchedules:['DAILY']}});
const vars=service.variables;
for(const [key,value] of Object.entries(vars)) {
  assert.equal(typeof value.isOptional,'boolean',key);
  assert.equal(typeof value.defaultValue,'string',key);
  assert(value.description.length>15,key);
}
assert.equal(vars.VARVE_API_TOKEN.defaultValue,'${{ secret(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") }}');
assert.equal(vars.VARVE_REQUIRE_VOLUME.defaultValue,'1');
assert.equal(vars.VARVE_DATA_DIR.defaultValue,'/data/varve');
assert.equal(vars.PORT.defaultValue,'8080');
assert.equal(vars.VARVE_HTTP_REQUEST_QUEUE.defaultValue,'64');
assert.equal(vars.VARVE_WS_ORIGINS.isOptional,true);
assert.equal(vars.VARVE_USE_S3.defaultValue,'true');
assert.equal(vars.VARVE_S3_BUCKET.defaultValue,'${{objects.BUCKET}}');
assert.equal(vars.VARVE_S3_ENDPOINT.defaultValue,'${{objects.ENDPOINT}}');
assert.equal(vars.AWS_ACCESS_KEY_ID.defaultValue,'${{objects.ACCESS_KEY_ID}}');
assert.equal(vars.AWS_SECRET_ACCESS_KEY.defaultValue,'${{objects.SECRET_ACCESS_KEY}}');
const secretFlag=process.argv.indexOf('--validation-secrets');
if(secretFlag>=0) {
  const secrets=JSON.parse(readFileSync(process.argv[secretFlag+1],'utf8'));
  const serialized=JSON.stringify(config)+readFileSync(resolve(root,'TEMPLATE_README.md'),'utf8');
  for(const [key,value] of Object.entries(secrets)) {
    if(/TOKEN|SECRET|ACCESS_KEY/i.test(key)&&typeof value==='string'&&value.length>=16) assert(!serialized.includes(value),'validation secret leaked: '+key);
  }
}
console.log(JSON.stringify({ok:true,services:1,buckets:1,variables:Object.keys(vars).length,generatedToken:true,referencedBucket:true,dailyBackups:true,replicas:1}));
