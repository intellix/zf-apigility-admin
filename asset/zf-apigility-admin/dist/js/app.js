!function(){"use strict";angular.module("ag-admin",["ngRoute","ngSanitize","ngTagsInput","angular-flash.service","angular-flash.flash-alert-directive","ui.sortable","ui.select2","toggle-switch"]).config(["$routeProvider","$provide",function(a,b){b.value("apiBasePath",angular.element("body").data("api-base-path")||"/admin/api"),a.when("/dashboard",{templateUrl:"html/index.html",controller:"DashboardController"}),a.when("/global/content-negotiation",{templateUrl:"html/global/content-negotiation/index.html",controller:"ContentNegotiationController",resolve:{selectors:["ContentNegotiationResource",function(a){return a.getList()}]}}),a.when("/global/db-adapters",{templateUrl:"html/global/db-adapters/index.html",controller:"DbAdapterController",resolve:{dbAdapters:["DbAdapterResource",function(a){return a.getList()}]}}),a.when("/global/authentication",{templateUrl:"html/global/authentication/index.html",controller:"AuthenticationController"}),a.when("/api/:apiName/:version/overview",{templateUrl:"html/api/overview.html",controller:"ApiOverviewController",resolve:{api:["$route","ApiRepository",function(a,b){return b.getApi(a.current.params.apiName,a.current.params.version)}]}}),a.when("/api/:apiName/:version/authorization",{templateUrl:"html/api/authorization.html",controller:"ApiAuthorizationController",resolve:{api:["$route","ApiRepository",function(a,b){return b.getApi(a.current.params.apiName,a.current.params.version)}],apiAuthorizations:["$route","ApiAuthorizationRepository",function(a,b){return b.getApiAuthorization(a.current.params.apiName,a.current.params.version)}],authentication:["AuthenticationRepository",function(a){return a.hasAuthentication()}]}}),a.when("/api/:apiName/:version/rest-services",{templateUrl:"html/api/rest-services/index.html",controller:"ApiRestServicesController",resolve:{dbAdapters:["DbAdapterResource",function(a){return a.getList()}],api:["$route","ApiRepository",function(a,b){return b.getApi(a.current.params.apiName,a.current.params.version)}],filters:["FiltersServicesRepository",function(a){return a.getList()}],validators:["ValidatorsServicesRepository",function(a){return a.getList()}],hydrators:["HydratorServicesRepository",function(a){return a.getList()}],selectors:["ContentNegotiationResource",function(a){return a.getList().then(function(a){var b=[];return angular.forEach(a,function(a){b.push(a.content_name)}),b})}]}}),a.when("/api/:apiName/:version/rpc-services",{templateUrl:"html/api/rpc-services/index.html",controller:"ApiRpcServicesController",resolve:{api:["$route","ApiRepository",function(a,b){return b.getApi(a.current.params.apiName,a.current.params.version)}],filters:["FiltersServicesRepository",function(a){return a.getList()}],validators:["ValidatorsServicesRepository",function(a){return a.getList()}],selectors:["ContentNegotiationResource",function(a){return a.getList().then(function(a){var b=[];return angular.forEach(a,function(a){b.push(a.content_name)}),b})}]}}),a.otherwise({redirectTo:"/dashboard"})}])}(),function(){"use strict";angular.module("ag-admin").run(["$rootScope","$routeParams","$location","$route",function(a,b,c,d){a.routeParams=b,a.$on("$routeChangeSuccess",function(a,b){a.targetScope.$root.navSection=d.current.controller,b.locals.api&&a.targetScope.$root.pageTitle!=b.locals.api.name&&(a.targetScope.$root.pageTitle=b.locals.api.name)})}])}(),function(a){"use strict";angular.module("ag-admin").controller("ApiAuthorizationController",["$http","$rootScope","$scope","$routeParams","flash","api","apiAuthorizations","authentication","ApiAuthorizationRepository",function(b,c,d,e,f,g,h,i,j){d.api=g,d.apiAuthorizations=h,d.authentication=i;var k=e.version.match(/\d/g)[0]||1;d.editable=k==g.versions[g.versions.length-1];var l=function(){var a={};return angular.forEach(g.restServices,function(b){var c=b.controller_service_name+"::__resource__",d=b.controller_service_name+"::__collection__",e={GET:!1,POST:!1,PUT:!1,PATCH:!1,DELETE:!1},f={GET:!1,POST:!1,PUT:!1,PATCH:!1,DELETE:!1};angular.forEach(b.entity_http_methods,function(a){e[a]=!0}),angular.forEach(b.collection_http_methods,function(a){f[a]=!0}),a[c]=e,a[d]=f}),angular.forEach(g.rpcServices,function(b){var c=b.controller_service_name,d={GET:!1,POST:!1,PUT:!1,PATCH:!1,DELETE:!1};angular.forEach(b.http_methods,function(a){d[a]=!0}),a[c]=d}),a}();d.isEditable=function(a,b){if(!d.editable)return!1;if(!l.hasOwnProperty(a)){var c=a.split("::"),e=c[0];if(!l.hasOwnProperty(e))return!1;a=e}return l[a][b]},d.saveAuthorization=function(){f.success="Authorization settings saved",j.saveApiAuthorizations(e.apiName,d.apiAuthorizations)},d.updateColumn=function(a,b){angular.forEach(d.apiAuthorizations,function(c,e){d.isEditable(e,b)&&(d.apiAuthorizations[e][b]=a.target.checked)})},d.updateRow=function(b,c){a.forEach(["GET","POST","PUT","PATCH","DELETE"],function(a){d.isEditable(c,a)&&(d.apiAuthorizations[c][a]=b.target.checked)})},d.showTopSaveButton=function(){return Object.keys(h).length>10}}])}(_),function(){"use strict";angular.module("ag-admin").controller("ApiCreateController",["$rootScope","$scope","$location","$timeout","flash","ApiRepository",function(a,b,c,d,e,f){b.showNewApiForm=!1,b.createNewApi=function(g){var h=angular.element(g.target);h.find("input").attr("disabled",!0),h.find("button").attr("disabled",!0),f.createNewApi(b.apiName).then(function(f){b.dismissModal(),b.resetForm(),a.$emit("refreshApiList"),e.success="New API Created",d(function(){c.path("/api/"+f.name+"/v1/overview")},500)})},b.resetForm=function(){b.showNewApiForm=!1,b.apiName=""}}])}(),function(a){"use strict";angular.module("ag-admin").controller("ApiDocumentationController",["$scope","$routeParams","flash","ApiRepository","ApiAuthorizationRepository",function(b,c,d,e,f){var g=c.apiName,h=c.version;if(b.service="undefined"!=typeof b.$parent.restService?b.$parent.restService:b.$parent.rpcService,b.authorizations={},"undefined"!=typeof b.$parent.restService){if("undefined"==typeof b.service.documentation&&(b.service.documentation={}),Array.isArray(b.service.documentation)){var i={};a.forEach(b.service.documentation,function(a,b){i[b]=a}),b.service.documentation=i}"undefined"==typeof b.service.documentation.collection&&(b.service.documentation.collection={}),a.forEach(b.service.collection_http_methods,function(a){"undefined"==typeof b.service.documentation.collection[a]&&(b.service.documentation.collection[a]={description:null,request:null,response:null})}),"undefined"==typeof b.service.documentation.entity&&(b.service.documentation.entity={}),a.forEach(b.service.entity_http_methods,function(a){"undefined"==typeof b.service.documentation.entity[a]&&(b.service.documentation.entity[a]={description:null,request:null,response:null})})}else{if("undefined"==typeof b.service.documentation&&(b.service.documentation={}),Array.isArray(b.service.documentation)){var i={};a.forEach(b.service.documentation,function(a,b){i[b]=a}),b.service.documentation=i}a.forEach(b.service.http_methods,function(a){"undefined"==typeof b.service.documentation[a]&&(b.service.documentation[a]={description:null,request:null,response:null})})}f.getServiceAuthorizations(b.service,g,h).then(function(a){b.authorizations=a}),b.requiresAuthorization=function(a,c){var d=b.authorizations;return"entity"==c||"collection"==c?d[c][a]:d[a]};var j=function(a){return"object"==typeof a&&Array.isArray(a)?-1===a.lastIndexOf("application/hal+json")?!1:!0:!1},k=function(a){return new Array(4*a).join(" ")},l=function(a,b,c,d,e){return"collection"==e&&(b=b.replace(/\[[a-zA-Z0-9_\/:\-]+\]$/,"")),d&&(b+=d),k(c)+'"'+a+'": {\n'+k(c+1)+'"href": "'+b+'"\n'+k(c)+"}"},m=function(a,b){return k(b)+'"_links": {\n'+a.join(",\n")+"\n"+k(b)+"}\n"},n=function(a,b,c){var d=[l("self",b,5)],e=k(1)+'"_embedded": {\n'+k(2)+'"'+a+'": [\n'+k(3)+"{\n";return e+=m(d,4),e+=c.join(",\n")+"\n"+k(3)+"}\n"+k(2)+"]\n"+k(1)+"}"};b.generate=function(c,d,e,f){var g="",h=[],i=!1,o=[];if("response"==e&&b.service.accept_whitelist&&(i=j(b.service.accept_whitelist)),a.forEach(b.service.input_filter,function(a){h.push(k(1)+'"'+a.name+'": "'+(a.description||"")+'"')}),!i||"collection"==f&&"POST"!=d)if(i&&"collection"==f){var p=b.service.collection_name?b.service.collection_name:"items";a.forEach(h,function(a,b){h[b]=k(3)+a}),o.push(l("self",b.service.route_match,2,!1,"collection")),o.push(l("first",b.service.route_match,2,"?page={page}","collection")),o.push(l("prev",b.service.route_match,2,"?page={page}","collection")),o.push(l("next",b.service.route_match,2,"?page={page}","collection")),o.push(l("last",b.service.route_match,2,"?page={page}","collection")),g="{\n"+m(o,1)+n(p,b.service.route_match,h)+"\n}"}else g="{\n"+h.join(",\n")+"\n}";else o.push(l("self",b.service.route_match,2)),g="{\n"+m(o,1)+h.join(",\n")+"\n}";c[e]?c[e]+="\n"+g:c[e]=g},b.save=function(){if(Array.isArray(b.service.documentation)){var c={};a.forEach(b.service.documentation,function(a,b){c[b]=a}),b.service.documentation=c}e.saveDocumentation(b.service),b.$parent.flash.success="Documentation saved."}}])}(_),function(){"use strict";angular.module("ag-admin").controller("ApiListController",["$rootScope","$scope","ApiRepository",function(a,b,c){b.apis=[],b.refreshApiList=function(){c.getList(!0).then(function(a){b.apis=a})},a.$on("refreshApiList",function(){b.refreshApiList()})}])}(),function(){"use strict";angular.module("ag-admin").controller("ApiOverviewController",["$http","$rootScope","$scope","flash","api","ApiRepository",function(a,b,c,d,e,f){c.api=e,c.defaultApiVersion=e.default_version,c.setDefaultApiVersion=function(){d.info="Setting the default API version to "+c.defaultApiVersion,f.setDefaultApiVersion(c.api.name,c.defaultApiVersion).then(function(a){d.success="Default API version updated",c.defaultApiVersion=a.version})}}])}(),function(a){"use strict";angular.module("ag-admin").controller("ApiRestServicesController",["$http","$rootScope","$scope","$timeout","$sce","flash","filters","hydrators","validators","selectors","ApiRepository","api","dbAdapters","toggleSelection",function(b,c,d,e,f,g,h,i,j,k,l,m,n,o){d.ApiRepository=l,d.flash=g,d.api=m,d.dbAdapters=n,d.filterOptions=h,d.hydrators=i,d.validatorOptions=j,d.selectors=k,d.sourceCode=[],d.deleteRestService=!1,d.toggleSelection=o,d.resetForm=function(){d.showNewRestServiceForm=!1,d.newService.restServiceName="",d.newService.dbAdapterName="",d.newService.dbTableName=""},d.isLatestVersion=function(){return d.ApiRepository.isLatestVersion(d.api)},d.isDbConnected=function(a){return"object"!=typeof a||"undefined"==typeof a?!1:a.hasOwnProperty("adapter_name")||a.hasOwnProperty("table_name")||a.hasOwnProperty("table_service")?!0:!1},d.newService={restServiceName:"",dbAdapterName:"",dbTableName:""},d.newService.createNewRestService=function(){l.createNewRestService(d.api.name,d.newService.restServiceName).then(function(){g.success="New REST Service created",e(function(){l.getApi(d.api.name,d.api.version,!0).then(function(a){d.api=a,d.currentVersion=a.currentVersion})},500),d.showNewRestServiceForm=!1,d.newService.restServiceName=""},function(){})},d.newService.createNewDbConnectedService=function(){l.createNewDbConnectedService(d.api.name,d.newService.dbAdapterName,d.newService.dbTableName).then(function(){g.success="New DB Connected Service created",e(function(){l.getApi(d.api.name,d.api.version,!0).then(function(a){d.api=a})},500),d.showNewRestServiceForm=!1,d.newService.dbAdapterName="",d.newService.dbTableName=""},function(){})},d.saveRestService=function(b){var c=a.clone(d.api.restServices[b]);l.saveRestService(d.api.name,c).then(function(){g.success="REST Service updated"})},d.removeRestService=function(a){l.removeRestService(d.api.name,a).then(function(){g.success="REST Service deleted",d.deleteRestService=!1,e(function(){l.getApi(d.api.name,d.api.version,!0).then(function(a){d.api=a,d.currentVersion=a.currentVersion})},500)})},d.getSourceCode=function(a,b){l.getSourceCode(d.api.name,a).then(function(c){d.filename=a+".php",d.classType=b+" Class",d.sourceCode="string"==typeof c.source?f.trustAsHtml(c.source):""})}}])}(_),function(a){"use strict";angular.module("ag-admin").controller("ApiRpcServicesController",["$http","$rootScope","$scope","$timeout","$sce","flash","filters","validators","selectors","ApiRepository","api","toggleSelection",function(b,c,d,e,f,g,h,i,j,k,l,m){d.ApiRepository=k,d.flash=g,d.api=l,d.toggleSelection=m,d.filterOptions=h,d.validatorOptions=i,d.selectors=j,d.sourceCode=[],d.deleteRpcService=!1,d.resetForm=function(){d.showNewRpcServiceForm=!1,d.rpcServiceName="",d.rpcServiceRoute=""},d.isLatestVersion=function(){return d.ApiRepository.isLatestVersion(d.api)},d.createNewRpcService=function(){k.createNewRpcService(d.api.name,d.rpcServiceName,d.rpcServiceRoute).then(function(){g.success="New RPC Service created",e(function(){k.getApi(d.api.name,d.api.version,!0).then(function(a){d.api=a,d.currentVersion=a.currentVersion})},500),d.addRpcService=!1,d.resetForm()})},d.saveRpcService=function(b){var c=a.clone(d.api.rpcServices[b]);k.saveRpcService(d.api.name,c).then(function(){g.success="RPC Service updated"})},d.removeRpcService=function(a){k.removeRpcService(d.api.name,a).then(function(){g.success="RPC Service deleted",d.deleteRpcService=!1,e(function(){k.getApi(d.api.name,d.api.version,!0).then(function(a){d.api=a,d.currentVersion=a.currentVersion})},500)})},d.getSourceCode=function(a,b){k.getSourceCode(d.api.name,a).then(function(c){d.filename=a+".php",d.classType=b+" Class",d.sourceCode="string"==typeof c.source?f.trustAsHtml(c.source):""})}}])}(_),function(a){"use strict";angular.module("ag-admin").controller("ApiServiceInputController",["$scope","flash",function(b,c){b.service="undefined"!=typeof b.$parent.restService?b.$parent.restService:b.$parent.rpcService,b.filterOptions=b.$parent.filterOptions,b.validatorOptions=b.$parent.validatorOptions,b.addInput=function(){if(!b.newInput||null===b.newInput||""===b.newInput||b.newInput.match(/^\s+$/))return void(c.error="Must provide an input name!");var a=!1;return b.service.input_filter.every(function(c){return b.newInput===c.name?(a=!0,!1):!0}),a?void(c.error="Input by the name "+b.newInput+" already exists!"):(b.service.input_filter.push({name:b.newInput,required:!0,filters:[],validators:[]}),void(b.newInput=""))},b.validateInputName=function(a){if(!a||null===a||""===a||a.match(/^\s+$/))return c.error="Input name can not be empty!",!1;var d=!1;return b.service.input_filter.every(function(b){return a===b.name?(d=!0,!1):!0}),d?(c.error="Input by the name "+a+" already exists!",!1):!0},b.removeInput=function(a){b.service.input_filter.splice(a,1)},b.removeOption=function(a,b){delete a[b]},b.addFilter=function(a){a.filters.push({name:a._newFilterName,options:{}}),a._newFilterName=""},b.removeFilter=function(a,b){a.filters.splice(b,1)},b.addFilterOption=function(a){"bool"==b.filterOptions[a.name][a._newOptionName]&&(a._newOptionValue="true"===a._newOptionValue),a.options[a._newOptionName]=a._newOptionValue,a._newOptionName="",a._newOptionValue=""},b.addValidator=function(a){a.validators.push({name:a._newValidatorName,options:{}}),a._newValidatorName=""},b.removeValidator=function(a,b){a.validators.splice(b,1)},b.addValidatorOption=function(a){"bool"==b.validatorOptions[a.name][a._newOptionName]&&(a._newOptionValue=a._newOptionValue===!0),a.options[a._newOptionName]=a._newOptionValue,a._newOptionName="",a._newOptionValue=""},b.saveInput=function(){function c(b,d,e){"string"==typeof d&&-1!=["_","$"].indexOf(d.charAt(0))?delete e[d]:b instanceof Object&&a.forEach(b,c)}var d=a.cloneDeep(b.service.input_filter);a.forEach(d,c);var e=b.$parent.ApiRepository;e.saveInputFilter(b.service,d),b.$parent.flash.success="Input Filter configuration saved."}}])}(_),function(){"use strict";angular.module("ag-admin").controller("ApiVersionController",["$rootScope","$scope","$location","$timeout","$routeParams","flash","ApiRepository",function(a,b,c,d,e,f,g){g.getApi(e.apiName,e.version).then(function(a){b.api=a,b.currentVersion=a.version,b.defaultApiVersion=a.default_version}),b.createNewApiVersion=function(){g.createNewVersion(b.api.name).then(function(e){f.success="A new version of this API was created",a.$broadcast("refreshApiList"),d(function(){c.path("/api/"+b.api.name+"/v"+e.version+"/overview")},500)})},b.setDefaultApiVersion=function(){f.info="Setting the default API version to "+b.defaultApiVersion,g.setDefaultApiVersion(b.api.name,b.defaultApiVersion).then(function(a){f.success="Default API version updated",b.defaultApiVersion=a.version})},b.changeVersion=function(){var a=c.path(),e=a.substr(a.lastIndexOf("/")+1);d(function(){c.path("/api/"+b.api.name+"/v"+b.currentVersion+"/"+e)},500)}}])}(),function(){"use strict";angular.module("ag-admin").controller("AuthenticationController",["$scope","flash","AuthenticationRepository",function(a,b,c){a.showSetupButtons=!1,a.showHttpBasicAuthenticationForm=!1,a.showHttpBasicAuthentication=!1,a.showHttpDigestAuthenticationForm=!1,a.showHttpDigestAuthentication=!1,a.showOAuth2AuthenticationForm=!1,a.showOAuth2Authentication=!1,a.removeAuthenticationForm=!1,a.httpBasic=null,a.httpDigest=null,a.oauth2=null;var d=function(){a.showSetupButtons=!0,a.showHttpBasicAuthentication=!1,a.showHttpDigestAuthentication=!1,a.showOAuth2Authentication=!1,a.removeAuthenticationForm=!1,a.httpBasic=null,a.httpDigest=null,a.oauth2=null},e=function(b){c.fetch({cache:!b}).then(function(b){"http_basic"==b.type?(a.showSetupButtons=!1,a.showHttpBasicAuthentication=!0,a.showHttpDigestAuthentication=!1,a.showOAuth2Authentication=!1,a.httpBasic=b,a.httpDigest=null,a.oauth2=null):"http_digest"==b.type?(a.showSetupButtons=!1,a.showHttpDigestAuthentication=!0,a.showHttpBasicAuthentication=!1,a.showOAuth2Authentication=!1,a.digest_domains=b.digest_domains.split(" "),a.httpDigest=b,a.httpDigest.digest_domains=b.digest_domains.split(" "),a.httpBasic=null,a.oauth2=null):"oauth2"==b.type?(a.showSetupButtons=!1,a.showOAuth2Authentication=!0,a.showHttpDigestAuthentication=!1,a.showHttpBasicAuthentication=!1,a.oauth2=b,a.httpDigest=null,a.httpBasic=null):d()},function(){return d(),!1})},f=function(d){c.createAuthentication(d).then(function(){b.success="Authentication created",e(!0),a.removeAuthenticationForm=!1,a.resetForm()},function(){b.error("Unable to create authentication; please verify that the DSN is valid.")})},g=function(a){a.hasOwnProperty("digest_domains")&&"object"==typeof a.digest_domains&&Array.isArray(a.digest_domains)&&(a.digest_domains=a.digest_domains.join(" ")),c.updateAuthentication(a).then(function(){b.success="Authentication updated",e(!0)},function(){b.error("Unable to update authentication; please verify that the DSN is valid.")})};a.resetForm=function(){a.showHttpBasicAuthenticationForm=!1,a.showHttpDigestAuthenticationForm=!1,a.showOAuth2AuthenticationForm=!1,a.digest_domains="",a.dsn="",a.htdigest="",a.htpasswd="",a.nonce_timeout="",a.password="",a.realm="",a.route_match="",a.username=""},a.showAuthenticationSetup=function(){return a.showHttpBasicAuthenticationForm||a.showHttpDigestAuthenticationForm||a.showOAuth2AuthenticationForm?!1:a.showSetupButtons},a.createHttpBasicAuthentication=function(){var b={accept_schemes:["basic"],realm:a.realm,htpasswd:a.htpasswd};f(b)},a.createHttpDigestAuthentication=function(){var b={accept_schemes:["digest"],realm:a.realm,htdigest:a.htdigest,digest_domains:a.digest_domains.join(" "),nonce_timeout:a.nonce_timeout};f(b)},a.createOAuth2Authentication=function(){var b={dsn:a.dsn,username:a.username,password:a.password,route_match:a.route_match};f(b)},a.updateHttpBasicAuthentication=function(){var b={realm:a.httpBasic.realm,htpasswd:a.httpBasic.htpasswd};g(b)},a.updateHttpDigestAuthentication=function(){var b={realm:a.httpDigest.realm,htdigest:a.httpDigest.htdigest,digest_domains:a.httpDigest.digest_domains.join(" "),nonce_timeout:a.httpDigest.nonce_timeout};g(b)},a.updateOAuth2Authentication=function(){var b={dsn:a.oauth2.dsn,username:a.oauth2.username,password:a.oauth2.password,route_match:a.oauth2.route_match};g(b)},a.removeAuthentication=function(){c.removeAuthentication().then(function(){b.success="Authentication removed",e(!0)})},e(!0)}])}(),function(a){"use strict";angular.module("ag-admin").controller("ContentNegotiationController",["$scope","$location","flash","selectors","ContentNegotiationResource",function(b,c,d,e,f){var g={content_name:"",viewModel:"",selectors:{}};b.showNewSelectorForm=!1,b.newSelector=a.cloneDeep(g),b.selectors=a.cloneDeep(e),b.resetNewSelectorForm=function(){b.showNewSelectorForm=!1,b.newSelector=a.cloneDeep(g)},b.addViewModel=function(a,c){c.selectors[a]=[],b.newSelector.viewModel=""},b.removeViewModel=function(a,b){delete b.selectors[a]},b.resetSelectorForm=function(a){var c,d=a.content_name;angular.forEach(e,function(a){c||a.content_name!==d||(c=a)}),c&&angular.forEach(b.selectors,function(a,d){a.content_name===c.content_name&&(b.selectors[d]=c)})},b.createSelector=function(){delete b.newSelector.viewModel,f.createSelector(b.newSelector).then(function(a){e.push(a),b.selectors.push(a),d.success="New selector created",b.resetNewSelectorForm()})},b.updateSelector=function(a){delete a.viewModel,f.updateSelector(a).then(function(a){var b=!1;angular.forEach(e,function(c,d){b||c.content_name!==a.content_name||(e[d]=a,b=!0)}),d.success="Selector updated"})},b.removeSelector=function(c){f.removeSelector(c).then(function(){d.success="Selector removed",f.getList().then(function(c){e=c,b.selectors=a.cloneDeep(e)})})}}])}(_),function(){"use strict";angular.module("ag-admin").controller("DashboardController",["$rootScope","flash",function(a){a.pageTitle="Dashboard",a.pageDescription="Global system configuration and configuration to be applied to all APIs."}])}(),function(){"use strict";angular.module("ag-admin").controller("DbAdapterController",["$scope","flash","DbAdapterResource","dbAdapters",function(a,b,c,d){a.dbAdapters=d,a.showNewDbAdapterForm=!1,a.resetForm=function(){return a.showNewDbAdapterForm=!1,a.adapterName="",a.driver="",a.database="",a.username="",a.password="",a.hostname="",a.port="",a.charset="",!0};var e=function(b){a.dbAdapters=[],c.getList(b).then(function(b){a.dbAdapters=b})};a.createNewDbAdapter=function(){var d={adapter_name:a.adapter_name,driver:a.driver,database:a.database,username:a.username,password:a.password,hostname:a.hostname,port:a.port,charset:a.charset};c.createNewAdapter(d).then(function(){b.success="Database adapter created",e(!0),a.resetForm()})},a.saveDbAdapter=function(d){var f=a.dbAdapters[d],g={driver:f.driver,database:f.database,username:f.username,password:f.password,hostname:f.hostname,port:f.port,charset:f.charset};c.saveAdapter(f.adapter_name,g).then(function(a){b.success="Database adapter "+a.adapter_name+" updated",e(!0)})},a.removeDbAdapter=function(d){c.removeAdapter(d).then(function(){b.success="Database adapter "+d+" removed",e(!0),a.deleteDbAdapter=!1})}}])}(_),function(){"use strict";angular.module("ag-admin").directive("collapse",function(){return{restrict:"E",transclude:!0,scope:{show:"&"},controller:["$scope","$parse",function(a){var b,c,d,e=[],f={};this.noChevron=!1;var g=this,h={};this.addButton=function(a){angular.forEach(a.criteria,function(b,c){a.criteria[c]=!!b}),e.push(a)},a.setConditionals=function(a){angular.forEach(a,function(a,b){f[b]=!!a})},a.setNoChevron=function(a){g.noChevron=!!a,c&&c.remove()},this.setFlags=function(a){angular.forEach(a,function(a,b){h.hasOwnProperty(b)?angular.forEach(h[b],function(b){b(a)}):f[b]=!!a})},this.addConditionalWatcher=function(a,b){angular.forEach(a,function(a,c){f.hasOwnProperty(c)||(f[c]=!1),a=!!a,"undefined"==typeof h[c]&&(h[c]=[]),h[c].push(function(d){d=!!d,f[c]=d,b.toggleClass("hide",a!==d)})})},a.showContainerButtons=this.showContainerButtons=function(){var a=!1;angular.forEach(e,function(b){var c=a;angular.forEach(b.criteria,function(a,b){f.hasOwnProperty(b)&&(c=c||f[b]!==a)}),b.element.toggleClass("hide",c)})},a.hideContainerButtons=this.hideContainerButtons=function(a){b.hasClass("in");angular.forEach(e,function(b){if(a.hasOwnProperty("leave")&&a.leave)return void b.element.toggleClass("hide",!0);var c=!0;angular.forEach(b.criteria,function(a,b){c&&f.hasOwnProperty(b)&&(c=f[b]===a)}),b.element.toggleClass("hide",c)})},this.setHead=function(a){d=a},this.setBody=function(c){b=c,b.hasClass("in")&&g.toggleChevron("up"),a.$watch(function(){return b.attr("class")},function(){g.toggleChevron(b.hasClass("in")?"up":"down")})},this.setChevron=function(a){c=a},this.expand=function(){b.addClass("in")},this.collapse=function(){b.removeClass("in")},this.toggle=function(){b.toggleClass("in"),g.toggleChevron()},this.toggleChevron=function(a){if(!g.noChevron){("undefined"==typeof a||null===a)&&(a=b.hasClass("in")?"up":"down");var d="up"===a?"down":"up",e="up"===d?"down":"up",f="glyphicon-chevron-"+d,h="glyphicon-chevron-"+e;c.hasClass(f)&&(c.removeClass(f),c.addClass(h))}}}],link:function(a,b,c){c.hasOwnProperty("show")&&"function"==typeof a.show&&(a.show()||b.toggleClass("hide",!0)),c.hasOwnProperty("conditionals")&&a.setConditionals(a.$eval(c.conditionals)),c.hasOwnProperty("noChevron")&&a.setNoChevron(!0)},template:'<div class="panel" ng-transclude></div>',replace:!0}}).directive("collapseHeader",function(){return{require:"^collapse",restrict:"E",transclude:!0,link:function(a,b,c,d){if(d.setHead(a),!d.noChevron){var e=angular.element('<i class="glyphicon glyphicon-chevron-down"></i>'),f=angular.element('<div class="ag-chevron pull-right"></div>');f.append(e),b.prepend(f),d.setChevron(e)}b.on("click",function(){d.toggle()}),b.on("mouseover",function(){d.showContainerButtons()}),b.on("mouseleave",function(){d.hideContainerButtons({leave:!0})})},template:'<div class="panel-heading" ng-transclude></div>',replace:!0}}).directive("collapseBody",function(){return{require:"^collapse",restrict:"E",transclude:!0,link:function(a,b,c,d){d.setBody(b)},template:'<div class="panel-collapse collapse" ng-transclude></div>',replace:!0}}).directive("collapseButton",function(){return{require:"^collapse",restrict:"A",link:function(a,b,c,d){var e={};c.hasOwnProperty("criteria")&&(e=a.$eval(c.criteria),"object"!=typeof e&&(e={})),d.addButton({criteria:e,element:b}),b.addClass("hide"),b.on("click",function(a){d.expand(),d.showContainerButtons(),a.stopPropagation()})}}}).directive("collapseFlag",function(){return{require:"^collapse",restrict:"A",link:function(a,b,c,d){if(c.hasOwnProperty("flags")){var e=a.$eval(c.flags);"object"==typeof e&&b.on("click",function(){d.setFlags(e)})}}}}).directive("collapseShow",function(){return{require:"^collapse",restrict:"A",link:function(a,b,c,d){if(c.hasOwnProperty("criteria")){var e=a.$eval(c.criteria);"object"==typeof e&&d.addConditionalWatcher(e,b)}}}})}(),function(){"use strict";angular.module("ag-admin").directive("agComment",function(){return{restrict:"E",compile:function(a){a.replaceWith("")}}})}(),function(){"use strict";angular.module("ag-admin").directive("agEditInplace",function(){return{restrict:"E",replace:!0,scope:{agInputName:"=name",validate:"&"},templateUrl:"/zf-apigility-admin/src/html/directives/ag-edit-inplace.html",controller:["$scope",function(a){var b;a.isFormVisible=!1,a.setInitialValue=function(a){b=a},a.resetForm=function(){a.agInputName=b,a.isFormVisible=!1}}],link:function(a,b,c){b.on("click",function(a){a.stopPropagation()}),a.setInitialValue(a.agInputName);var d=angular.element(b.children()[0]),e=angular.element(b.children()[1]);c.hasOwnProperty("validate")&&"function"==typeof a.validate?e.on("submit",function(){a.validate(a.agInputName)&&(a.isFormVisible=!1)}):e.on("submit",function(){a.isFormVisible=!1}),a.$watch("isFormVisible",function(a){return a?(d.toggleClass("hide",!0),void e.toggleClass("hide",!1)):(d.toggleClass("hide",!1),void e.toggleClass("hide",!0))})}}})}(),function(){"use strict";angular.module("ag-admin").directive("agHover",function(){return{restrict:"A",controller:["$scope",function(a){var b;this.setTarget=function(a){b=a},this.toggleHide=a.toggleHide=function(a){b.toggleClass("hide",a)}}],link:function(a,b){b.on("mouseover",function(){a.toggleHide(!1)}),b.on("mouseleave",function(){a.toggleHide(!0)})}}}).directive("agHoverTarget",function(){return{require:"^agHover",restrict:"A",link:function(a,b,c,d){d&&(d.setTarget(b),d.toggleHide(!0))}}})}(),function(a){"use strict";angular.module("ag-admin").directive("agInclude",["$http","$templateCache","$compile",function(b,c,d){return{restrict:"E",transclude:!0,replace:!0,link:function(e,f,g){return g.hasOwnProperty("src")?void b.get(g.src,{cache:c}).success(function(a){var b=angular.element("<div/>").html(a).contents();f.html(b),d(b)(e)}):void a.error('ag-include requires a "src" attribute; none provided!')}}}])}(console),function(){"use strict";angular.module("ag-admin").directive("agModalDismiss",function(){return{restrict:"A",link:function(a,b){a.dismissModal=function(){b.modal("hide")}}}})}(),function(){"use strict";angular.module("ag-admin").directive("agTabs",function(){return{restrict:"E",transclude:!0,scope:{parent:"="},controller:["$scope","$element",function(a){var b=a.panes=[];a.select=function(a){angular.forEach(b,function(a){a.selected=!1}),a.selected=!0},this.addPane=function(c){0===b.length&&a.select(c),b.push(c)}}],link:function(a,b,c){var d="nav-tabs";c.hasOwnProperty("pills")&&(d="nav-pills"),angular.forEach(b.children(),function(a){a=angular.element(a),"UL"===a.context.tagName&&a.addClass(d)})},template:'<div class="ag-tabs"><ul class="nav"><li ng-repeat="pane in panes" ng-class="{active:pane.selected}"><a href="" ng-click="select(pane)">{{pane.title}}</a></li></ul><div class="tab-content" ng-transclude></div></div>',replace:!0}}).directive("agTabPane",function(){return{require:"^agTabs",restrict:"E",transclude:!0,scope:{title:"@"},link:function(a,b,c,d){d.addPane(a)},template:'<div class="tab-pane" ng-class="{active: selected}" ng-transclude></div>',replace:!0}})}(),function(){"use strict";angular.module("ag-admin").filter("servicetype",function(){return function(a){var b=a.split("::");switch(b[1]){case"__collection__":return"(Collection)";case"__resource__":return"(Entity)";default:return""}}})}(),function(){"use strict";angular.module("ag-admin").filter("namespaceclassid",function(){return function(a){return a.replace(/\\/g,"_")}})}(),function(){"use strict";angular.module("ag-admin").filter("servicename",function(){return function(a){var b=/^[^\\]+\\{1,2}V[^\\]+\\{1,2}(Rest|Rpc)\\{1,2}([^\\]+)\\{1,2}.*?Controller.*?$/;return a.match(b)?a.replace(b,"$2"):a}})}(),function(a){"use strict";angular.module("ag-admin").factory("ApiAuthorizationRepository",["$http","apiBasePath","Hal",function(b,c,d){return{getApiAuthorization:function(a,e,f){f=!!f,"string"==typeof e&&(e=parseInt(e.match(/\d/g)[0],10));var g={method:"GET",url:c+"/module/"+a+"/authorization",params:{version:e},cache:!f};return b(g).then(function(a){return d.props(a.data)})},getServiceAuthorizations:function(b,c,d){return this.getApiAuthorization(c,d).then(function(c){var d,e={},f=!1,g=b.controller_service_name;g=g.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&");var h=new RegExp("^"+g+"::(.*?)$"),i=new RegExp("^__([^_]+)__$");return a.forEach(c,function(a,b){if(!f&&(d=h.exec(b),Array.isArray(d))){var c=d[1];if(d=i.exec(c),Array.isArray(d)){var g=d[1];return"resource"==g&&(g="entity"),void(e[g]=a)}e=a,f=!0}}),e})},saveApiAuthorizations:function(a,e){var f=c+"/module/"+a+"/authorization";return b.put(f,e).then(function(a){return d.props(a.data)})}}}])}(_),function(a){"use strict";angular.module("ag-admin").factory("ApiRepository",["$q","$http","apiBasePath","Hal",function(b,c,d,e){var f=d+"/module";return{currentApiModel:null,getList:function(a){a=!!a;var b={method:"GET",url:f,cache:!a};return c(b).then(function(a){var b=e.pluckCollection("module",a.data);return b=e.stripLinks(b),e.stripEmbedded(b)})},getApi:function(d,g,h){h=!!h;var i={},j=b.defer(),k=this;if("string"==typeof g&&(g=parseInt(g.match(/\d/g)[0],10)),!h&&k.currentApiModel&&g&&k.currentApiModel.name==d&&k.currentApiModel.version==g)return j.resolve(k.currentApiModel),j.promise;
var l={method:"GET",url:f,cache:!h};return c(l).then(function(b){var c=e.pluckCollection("module",b.data),f=a.find(c,function(a){return a.name===d});return a.forEach(e.stripLinks(f),function(a,b){i[b]=a}),i.restServices=[],i.rpcServices=[],g||(g=f.versions[f.versions.length-1]),f}).then(function(b){var d=k.getHttpConfigFromLink("rest",b);return d.method="GET",d.params.version=g,c(d).then(function(c){return i.restServices=e.pluckCollection("rest",c.data),a.forEach(i.restServices,function(b){if(b._self=e.getLink("self",b),b.input_filter=[],b.documentation=[],b._embedded&&(b._embedded&&b._embedded.input_filters&&b._embedded.input_filters[0]&&(b.input_filter=e.props(b._embedded.input_filters[0]),a.forEach(b.input_filter,function(a,c){k.marshalInputFilter(b,a,c)}),b.input_filter=a.toArray(b.input_filter)),b._embedded.documentation)){var c=e.pluckCollection("documentation",b);b.documentation=e.props(c)}}),b})}).then(function(b){var d=k.getHttpConfigFromLink("rpc",b);return d.method="GET",d.params.version=g,c(d).then(function(c){return i.rpcServices=e.pluckCollection("rpc",c.data),a.forEach(i.rpcServices,function(b){if(b._self=e.getLink("self",b),b.input_filter=[],b.documentation=[],b._embedded&&(b._embedded.input_filters&&b._embedded.input_filters[0]&&(b.input_filter=e.props(b._embedded.input_filters[0]),a.forEach(b.input_filter,function(a,c){k.marshalInputFilter(b,a,c)}),b.input_filter=a.toArray(b.input_filter)),b._embedded.documentation)){var c=e.pluckCollection("documentation",b);b.documentation=e.props(c)}}),b})}).then(function(){j.resolve(i),k.currentApiModel=i,k.currentApiModel.version=g}),j.promise},createNewApi:function(a){return c.post(f,{name:a}).then(function(a){return a.data})},createNewRestService:function(a,b){return c.post(f+"/"+a+"/rest",{resource_name:b}).then(function(a){return a.data})},createNewDbConnectedService:function(a,b,d){return c.post(f+"/"+a+"/rest",{adapter_name:b,table_name:d}).then(function(a){return a.data})},createNewRpcService:function(a,b,d){return c.post(f+"/"+a+"/rpc",{service_name:b,route:d}).then(function(a){return a.data})},removeRestService:function(a,b){var d=f+"/"+a+"/rest/"+encodeURIComponent(b);return c.delete(d).then(function(a){return a.data})},saveRestService:function(a,b){var d=f+"/"+a+"/rest/"+encodeURIComponent(b.controller_service_name);return c({method:"patch",url:d,data:b}).then(function(a){return a.data})},saveInputFilter:function(a,b){var d=a._self+"/input-filter";return c.put(d,b)},saveDocumentation:function(a){var b=a._self+"/doc";return c.put(b,a.documentation)},removeRpcService:function(a,b){var d=f+"/"+a+"/rpc/"+encodeURIComponent(b);return c.delete(d).then(function(a){return a.data})},saveRpcService:function(a,b){var d=f+"/"+a+"/rpc/"+encodeURIComponent(b.controller_service_name);return c({method:"patch",url:d,data:b}).then(function(a){return a.data})},getSourceCode:function(a,b){return c.get(d+"/source?module="+a+"&class="+b).then(function(a){return a.data})},createNewVersion:function(a){return c({method:"patch",url:d+"/versioning",data:{module:a}}).then(function(a){return a.data})},setDefaultApiVersion:function(a,b){return c({method:"patch",url:"/admin/api/default-version",data:{module:a,version:b}}).then(function(a){return a.data})},getLatestVersion:function(a){var b=a.versions,c=b.pop();return b.push(c),c},isLatestVersion:function(a){var b=this.getLatestVersion(a);return a.version===b},marshalInputFilter:function(b,c,d){return"string"==typeof c?void delete b.input_filter[d]:("undefined"==typeof c.validators?c.validators=[]:a.forEach(c.validators,function(a){("undefined"==typeof a.options||0===a.options.length)&&(a.options={})}),"undefined"==typeof c.filters?c.filters=[]:a.forEach(c.filters,function(a){("undefined"==typeof a.options||0===a.options.length)&&(a.options={})}),c.required="undefined"==typeof c.required?!0:!!c.required,c.allow_empty="undefined"==typeof c.allow_empty?!1:!!c.allow_empty,void(c.continue_if_empty="undefined"==typeof c.continue_if_empty?!1:!!c.continue_if_empty))},getHttpConfigFromLink:function(b,c){var d={uri:null,params:{}},f=e.getLink(b,c);f=f.replace(/\{[^}]+\}/,"","g");var g=f.match(/^([^?]+)\?(.*?)$/);if(!Array.isArray(g))return d.url=f,d;d.url=g[1],d.params={};var h=g[2].split("&");return a.forEach(h,function(a){return a.match(/\=/)?(a=a.split("=",2),void(d.params[a[0]]=a[1])):void(d.params[a]=!0)}),d}}}])}(_),function(){"use strict";angular.module("ag-admin").factory("AuthenticationRepository",["$http","$q","apiBasePath",function(a,b,c){var d=c+"/authentication";return{hasAuthentication:function(){return this.fetch({cache:!1}).then(function(a){var b=!0;return""===a&&(b=!1),{configured:b}},function(){return{configured:!1}})},fetch:function(b){return a.get(d,b).then(function(a){return a.data})},createAuthentication:function(b){return a.post(d,b).then(function(a){return a.data})},updateAuthentication:function(b){return a({method:"patch",url:d,data:b}).then(function(a){return a.data})},removeAuthentication:function(){return a.delete(d).then(function(){return!0},function(){return!1})}}}])}(),function(){"use strict";angular.module("ag-admin").factory("ContentNegotiationResource",["$http","flash","apiBasePath",function(a,b,c){var d=c+"/content-negotiation";return{prepareSelector:function(a){var b={content_name:a.content_name};return angular.forEach(a.selectors,function(a,c){b[c]=a}),b},getList:function(){return a({method:"GET",url:d}).then(function(a){return a.data._embedded.selectors},function(){b.error="Unable to fetch content negotiation selectors; you may need to reload the page"})},createSelector:function(c){return a({method:"POST",url:d,data:this.prepareSelector(c)}).then(function(a){return a.data},function(a){return b.error="Unable to create selector; please try again",a})},updateSelector:function(c){var e=d+"/"+encodeURIComponent(c.content_name),f=this.prepareSelector(c);return delete f.content_name,a({method:"PATCH",url:e,data:f}).then(function(a){return a.data},function(a){return b.error="Unable to create selector; please try again",a})},removeSelector:function(c){var e=d+"/"+encodeURIComponent(c);return a({method:"DELETE",url:e}).then(function(a){return a.data},function(a){return b.error="Unable to remove selector; please try again",a})}}}])}(),function(){"use strict";angular.module("ag-admin").factory("DbAdapterResource",["$http","apiBasePath","Hal",function(a,b,c){var d=b+"/db-adapter";return{getList:function(b){b=!!b;var e={method:"GET",url:d,cache:!b};return a(e).then(function(a){var b=c.pluckCollection("db_adapter",a.data);return c.props(b)})},createNewAdapter:function(b){return a.post(d,b).then(function(a){return c.props(a.data)})},saveAdapter:function(b,e){return a({method:"patch",url:d+"/"+encodeURIComponent(b),data:e}).then(function(a){return c.props(a.data)})},removeAdapter:function(b){return a.delete(d+"/"+encodeURIComponent(b)).then(function(){return!0})}}}])}(_),function(){"use strict";angular.module("ag-admin").factory("FiltersServicesRepository",["$http","flash","apiBasePath",function(a,b,c){var d=c+"/filters";return{getList:function(){var c=a({method:"GET",url:d}).then(function(a){return a.data.filters},function(){return b.error="Unable to fetch filters for filter dropdown; you may need to reload the page",!1});return c}}}])}(),function(){"use strict";angular.module("ag-admin").factory("HydratorServicesRepository",["$http","flash","apiBasePath",function(a,b,c){var d=c+"/hydrators";return{getList:function(){var c=a({method:"GET",url:d}).then(function(a){return a.data.hydrators},function(){b.error="Unable to fetch hydrators for hydrator dropdown; you may need to reload the page"});return c}}}])}(),function(){"use strict";angular.module("ag-admin").factory("toggleSelection",function(){return function(a,b){var c=b.target;c.checked?a.push(c.value):a.splice(a.indexOf(c.value),1)}})}(),function(){"use strict";angular.module("ag-admin").factory("ValidatorsServicesRepository",["$http","flash","apiBasePath",function(a,b,c){var d=c+"/validators";return{getList:function(){var c=a({method:"GET",url:d}).then(function(a){return a.data.validators},function(){return b.error="Unable to fetch validators for validator dropdown; you may need to reload the page",!1});return c}}}])}(),function(a){"use strict";angular.module("ag-admin").factory("Hal",function(){return{props:function(a){return a=this.stripLinks(a),this.stripEmbedded(a)},stripLinks:function(b){if("object"!=typeof b)return b;if(Array.isArray(b)){var c=this;return a.forEach(b,function(a){b.key=c.stripLinks(a)}),b}if(!b._links)return b;var d=a.cloneDeep(b);return delete d._links,d},stripEmbedded:function(b){if("object"!=typeof b)return b;if(Array.isArray(b)){var c=this;return a.forEach(b,function(a){b.key=c.stripEmbedded(a)}),b}if(!b._embedded)return b;var d=a.cloneDeep(b);return delete d._embedded,d},pluckCollection:function(b,c){if("object"!=typeof c||Array.isArray(c))return[];if(!c._embedded)return[];if(!c._embedded[b])return[];var d=a.cloneDeep(c._embedded[b]);return d},getLink:function(a,b){return"object"!=typeof b||Array.isArray(b)?!1:b._links&&b._links[a]&&b._links[a].href?b._links[a].href:!1}}})}(_);
        $routeProvider.when('/global/doctrine-adapters', {
            templateUrl: 'zf-apigility-admin/dist/html/global/doctrine-adapters/index.html',
            controller: 'DoctrineAdapterController'
        });
        $routeProvider.when('/global/authentication', {
            templateUrl: 'zf-apigility-admin/dist/html/global/authentication/index.html',
            controller: 'AuthenticationController'
        });
        $routeProvider.when('/api/:apiName/:version/overview', {
            templateUrl: 'zf-apigility-admin/dist/html/api/overview.html',
            controller: 'ApiOverviewController',
            resolve: {
                api: ['$route', 'ApiRepository', function ($route, ApiRepository) {
                    return ApiRepository.getApi($route.current.params.apiName, $route.current.params.version);
                }]
            }
        });
        $routeProvider.when('/api/:apiName/:version/authorization', {
            templateUrl: 'zf-apigility-admin/dist/html/api/authorization.html',
            controller: 'ApiAuthorizationController',
            resolve: {
                api: ['$route', 'ApiRepository', function ($route, ApiRepository) {
                    return ApiRepository.getApi($route.current.params.apiName, $route.current.params.version);
                }],
                apiAuthorizations: ['$route', 'ApiAuthorizationRepository', function ($route, ApiAuthorizationRepository) {
                    return ApiAuthorizationRepository.getApiAuthorization($route.current.params.apiName, $route.current.params.version);
                }],
                authentication: ['AuthenticationRepository', function (AuthenticationRepository) {
                    return AuthenticationRepository.hasAuthentication();
                }]
            }
        });
        $routeProvider.when('/api/:apiName/:version/rest-services', {
            templateUrl: 'zf-apigility-admin/dist/html/api/rest-services/index.html',
            controller: 'ApiRestServicesController',
            resolve: {
                dbAdapters: ['DbAdapterResource', function (DbAdapterResource) {
                    return DbAdapterResource.getList();
                }],
                doctrineAdapters: ['DoctrineAdapterResource', function (DoctrineAdapterResource) {
                    return DoctrineAdapterResource.getList();
                }],
                
                api: ['$route', 'ApiRepository', function ($route, ApiRepository) {
                    return ApiRepository.getApi($route.current.params.apiName, $route.current.params.version);
                }],
                filters: ['FiltersServicesRepository', function (FiltersServicesRepository) {
                    return FiltersServicesRepository.getList();
                }],
                validators: ['ValidatorsServicesRepository', function (ValidatorsServicesRepository) {
                    return ValidatorsServicesRepository.getList();
                }],
                hydrators: ['HydratorServicesRepository', function (HydratorServicesRepository) {
                    return HydratorServicesRepository.getList();
                }],
                selectors: ['ContentNegotiationResource', function (ContentNegotiationResource) {
                    return ContentNegotiationResource.getList().then(function (selectors) {
                        var selectorNames = [];
                        angular.forEach(selectors, function (selector) {
                            selectorNames.push(selector.content_name);
                        });
                        return selectorNames;
                    });
                }]
            }
        });
        $routeProvider.when('/api/:apiName/:version/rpc-services', {
            templateUrl: 'zf-apigility-admin/dist/html/api/rpc-services/index.html',
            controller: 'ApiRpcServicesController',
            resolve: {
                api: ['$route', 'ApiRepository', function ($route, ApiRepository) {
                    return ApiRepository.getApi($route.current.params.apiName, $route.current.params.version);
                }],
                filters: ['FiltersServicesRepository', function (FiltersServicesRepository) {
                    return FiltersServicesRepository.getList();
                }],
                validators: ['ValidatorsServicesRepository', function (ValidatorsServicesRepository) {
                    return ValidatorsServicesRepository.getList();
                }],
                selectors: ['ContentNegotiationResource', function (ContentNegotiationResource) {
                    return ContentNegotiationResource.getList().then(function (selectors) {
                        var selectorNames = [];
                        angular.forEach(selectors, function (selector) {
                            selectorNames.push(selector.content_name);
                        });
                        return selectorNames;
                    });
                }]
            }
        });
        $routeProvider.otherwise({redirectTo: '/dashboard'});
    }
]);

})();

(function(_) {'use strict';

angular.module('ag-admin').controller(
    'ApiAuthorizationController',
    ['$http', '$rootScope', '$scope', '$routeParams', 'flash', 'api', 'apiAuthorizations', 'authentication', 'ApiAuthorizationRepository', function ($http, $rootScope, $scope, $routeParams, flash, api, apiAuthorizations, authentication, ApiAuthorizationRepository) {
        $scope.api = api;
        $scope.apiAuthorizations = apiAuthorizations;
        $scope.authentication = authentication;

        var version = $routeParams.version.match(/\d/g)[0] || 1;
        $scope.editable = (version == api.versions[api.versions.length - 1]);

        var serviceMethodMap = (function() {
            var services = {};
            angular.forEach(api.restServices, function(service) {
                var entityName = service.controller_service_name + '::__resource__';
                var collectionName = service.controller_service_name + '::__collection__';
                var entityMethods = {
                    GET: false,
                    POST: false,
                    PUT: false,
                    PATCH: false,
                    DELETE: false,
                };
                var collectionMethods = {
                    GET: false,
                    POST: false,
                    PUT: false,
                    PATCH: false,
                    DELETE: false,
                };
                angular.forEach(service.resource_http_methods, function(method) {
                    entityMethods[method] = true;
                });
                angular.forEach(service.collection_http_methods, function(method) {
                    collectionMethods[method] = true;
                });
                services[entityName] = entityMethods;
                services[collectionName] = collectionMethods;
            });

            angular.forEach(api.rpcServices, function(service) {
                var serviceName = service.controller_service_name;
                var serviceMethods = {
                    GET: false,
                    POST: false,
                    PUT: false,
                    PATCH: false,
                    DELETE: false,
                };
                angular.forEach(service.http_methods, function(method) {
                    serviceMethods[method] = true;
                });
                services[serviceName] = serviceMethods;
            });

            return services;
        })();

        $scope.isEditable = function(serviceName, method) {
            if (!$scope.editable) {
                return false;
            }

            if (!serviceMethodMap.hasOwnProperty(serviceName)) {
                var parts = serviceName.split('::');
                var test  = parts[0];
                if (!serviceMethodMap.hasOwnProperty(test)) {
                    return false;
                }
                serviceName = test;
            }

            return serviceMethodMap[serviceName][method];
        };

        $scope.saveAuthorization = function () {
            flash.success = 'Authorization settings saved';
            ApiAuthorizationRepository.saveApiAuthorizations($routeParams.apiName, $scope.apiAuthorizations);
        };

        $scope.updateColumn = function ($event, column) {
            angular.forEach($scope.apiAuthorizations, function (item, name) {
                if ($scope.isEditable(name, column)) {
                    $scope.apiAuthorizations[name][column] = $event.target.checked;
                }
            });
        };

        $scope.updateRow = function ($event, name) {
            _.forEach(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], function (method) {
                if ($scope.isEditable(name, method)) {
                    $scope.apiAuthorizations[name][method] = $event.target.checked;
                }
            });
        };

        $scope.showTopSaveButton = function () {
            return (Object.keys(apiAuthorizations).length > 10);
        };
    }]
);

})(_);

(function() {'use strict';

angular.module('ag-admin').controller(
    'ApiCreateController',
    ['$rootScope', '$scope', '$location', '$timeout', 'flash', 'ApiRepository', function($rootScope, $scope, $location, $timeout, flash, ApiRepository) {

        $scope.showNewApiForm = false;

        $scope.createNewApi = function ($event) {
            var form = angular.element($event.target);
            form.find('input').attr('disabled', true);
            form.find('button').attr('disabled', true);

            ApiRepository.createNewApi($scope.apiName).then(function (newApi) {
                // reset form, repopulate, redirect to new
                $scope.dismissModal();
                $scope.resetForm();
                $rootScope.$emit('refreshApiList');

                flash.success = 'New API Created';
                $timeout(function () {
                    $location.path('/api/' + newApi.name + '/v1/overview');
                }, 500);
            });
        };

        $scope.resetForm = function () {
            $scope.showNewApiForm = false;
            $scope.apiName = '';
        };
    }]
);
})();

(function(_) {'use strict';

angular.module('ag-admin').controller(
    'ApiDocumentationController',
    ['$rootScope', '$scope', '$timeout', '$routeParams', 'flash', 'ApiRepository', 'ApiAuthorizationRepository',
    function ($rootScope, $scope, $timeout, $routeParams, flash, ApiRepository, ApiAuthorizationRepository) {

        var moduleName = $routeParams.apiName;
        var version    = $routeParams.version;
        
        $scope.service = (typeof $scope.$parent.restService != 'undefined') ? $scope.$parent.restService : $scope.$parent.rpcService;
        $scope.authorizations = {};

        // for REST
        if (typeof $scope.$parent.restService != 'undefined') {
            if (typeof $scope.service.documentation == 'undefined') {
                $scope.service.documentation = {};
            }
            if (typeof $scope.service.documentation.collection == 'undefined') {
                $scope.service.documentation.collection = {};
            }
            _.forEach($scope.service.collection_http_methods, function (allowed_method) {
                if (typeof $scope.service.documentation.collection[allowed_method] == 'undefined') {
                    $scope.service.documentation.collection[allowed_method] = {description: null, request: null, response: null};
                }
            });
            if (typeof $scope.service.documentation.entity == 'undefined') {
                $scope.service.documentation.entity = {};
            }
            _.forEach($scope.service.resource_http_methods, function (allowed_method) {
                if (typeof $scope.service.documentation.entity[allowed_method] == 'undefined') {
                    $scope.service.documentation.entity[allowed_method] = {description: null, request: null, response: null};
                }
            });

        // for RPC
        } else {
            if (typeof $scope.service.documentation == 'undefined') {
                $scope.service.documentation = {};
            }
            _.forEach($scope.service.http_methods, function (allowed_method) {
                if (typeof $scope.service.documentation[allowed_method] == 'undefined') {
                    $scope.service.documentation[allowed_method] = {description: null, request: null, response: null};
                }
            });
        }

        ApiAuthorizationRepository.getServiceAuthorizations($scope.service, moduleName, version).then(function (authorizations) {
            $scope.authorizations = authorizations;
        });

        $scope.requiresAuthorization = function (method, type) {
            var authorizations = $scope.authorizations;
            if (type == 'entity' || type == 'collection') {
                return authorizations[type][method];
            }
            return authorizations[method];
        };

        var hasHalMediaType = function (mediatypes) {
            if (typeof mediatypes !== 'object' || !Array.isArray(mediatypes)) {
                return false;
            }

            if (mediatypes.lastIndexOf('application/hal+json') === -1) {
                return false;
            }

            return true;
        };

        var tab = function (num) {
            return new Array(num * 4).join(' ');
        };

        var createLink = function (rel, routeMatch, indent, append, type) {
            if (type == 'collection') {
                routeMatch = routeMatch.replace(/\[[a-zA-Z0-9_\/:\-]+\]$/, '');
            }
            if (append) {
                routeMatch += append;
            }
            return tab(indent) + "\"" + rel + "\": {\n" + tab(indent + 1) + "\"href\": \"" + routeMatch + "\"\n" + tab(indent) + "}";
        };

        var createLinks = function (links, indent) {
            return tab(indent) + "\"_links\": {\n" + links.join(",\n") + "\n" + tab(indent) + "}\n";
        };

        var createCollection = function (collectionName, routeMatch, params) {
            var entityLinks = [ createLink('self', routeMatch, 5) ];
            var collection = tab(1) + "\"_embedded\": {\n" + tab(2) + "\"" + collectionName + "\": [\n" + tab(3) + "{\n";
            collection += createLinks(entityLinks, 4);
            collection += params.join(",\n") + "\n" + tab(3) + "}\n" + tab(2) + "]\n" + tab(1) + "}";
            return collection;
        };

        $scope.generate = function(model, method, direction, restPart) {
            var doctext   = '';
            var docparams = [];
            var isHal     = false;
            var links     = [];

            if (direction == 'response' && $scope.service.accept_whitelist) {
                isHal = hasHalMediaType($scope.service.accept_whitelist);
            }

            _.forEach($scope.service.input_filter, function (item) {
                docparams.push(tab(1) + '"' + item.name + '": "' + (item.description || '') + '"');
            });
            

            if (isHal && (restPart != 'collection' || method == 'POST')) {
                links.push(createLink('self', $scope.service.route_match, 2));
                doctext = "{\n" + createLinks(links, 1) + docparams.join(",\n") + "\n}";
            } else if (isHal && restPart == 'collection') {
                var collectionName = $scope.service.collection_name ? $scope.service.collection_name : 'items';
                _.forEach(docparams, function (param, key) {
                    docparams[key] = tab(3) + param;
                });
                links.push(createLink('self', $scope.service.route_match, 2, false, 'collection'));
                links.push(createLink('first', $scope.service.route_match, 2, '?page={page}', 'collection'));
                links.push(createLink('prev', $scope.service.route_match, 2, '?page={page}', 'collection'));
                links.push(createLink('next', $scope.service.route_match, 2, '?page={page}', 'collection'));
                links.push(createLink('last', $scope.service.route_match, 2, '?page={page}', 'collection'));
                doctext = "{\n" + createLinks(links, 1) + createCollection(collectionName, $scope.service.route_match, docparams) + "\n}";
            } else {
                doctext = "{\n" + docparams.join(",\n") + "\n}";
            }

            if (!model[direction]) {
                model[direction] = doctext;
            } else {
                model[direction] += "\n" + doctext;
            }

        };

        $scope.save = function() {
            ApiRepository.saveDocumentation($scope.service);
            $scope.$parent.flash.success = 'Documentation saved.';
        };

    }]
);

})(_);

(function() {'use strict';

angular.module('ag-admin').controller(
    'ApiListController',
    ['$rootScope', '$scope', 'ApiRepository', function($rootScope, $scope, ApiRepository) {

        $scope.apis = [];

        $scope.refreshApiList = function () {
            ApiRepository.getList(true).then(function (apis) { $scope.apis = apis; });
        };

        $rootScope.$on('refreshApiList', function () { $scope.refreshApiList(); });
    }]
);
})();

(function() {'use strict';

angular.module('ag-admin').controller('ApiOverviewController', ['$http', '$rootScope', '$scope', 'flash', 'api', 'ApiRepository', function ($http, $rootScope, $scope, flash, api, ApiRepository) {
    $scope.api = api;
    $scope.defaultApiVersion = api.default_version;
    $scope.setDefaultApiVersion = function () {
        flash.info = 'Setting the default API version to ' + $scope.defaultApiVersion;
        ApiRepository.setDefaultApiVersion($scope.api.name, $scope.defaultApiVersion).then(function (data) {
            flash.success = 'Default API version updated';
            $scope.defaultApiVersion = data.version;
        });
    };
}]);

})();

(function(_) {'use strict';

angular.module('ag-admin').controller(
  'ApiRestServicesController', 
  ['$http', '$rootScope', '$scope', '$timeout', '$sce', 'flash', 'filters', 'hydrators', 'validators', 'selectors', 'ApiRepository', 'api', 'dbAdapters', 'doctrineAdapters', 'toggleSelection', 
  function ($http, $rootScope, $scope, $timeout, $sce, flash, filters, hydrators, validators, selectors, ApiRepository, api, dbAdapters, doctrineAdapters, toggleSelection) {
    $scope.doctrineAdapters = doctrineAdapters;

        doctrineObjectManager: 'doctrine.entitymanager.orm_default',
        doctrineHydrator: 'DoctrineModule\\Stdlib\\Hydrator\\DoctrineObject',
        doctrineResourceName: '',
        doctrineEntityClass:''
    $scope.newService.createNewDoctrineConnectedService = function () {
        ApiRepository.createNewDoctrineConnectedService(
            $scope.api.name, $scope.newService.doctrineResourceName, $scope.newService.doctrineEntityClass, $scope.newService.doctrineObjectManager, $scope.newService.doctrineHydrator
        ).then(function (restResource) {
            flash.success = 'New Doctrine Connected Service created';
            $timeout(function () {
                ApiRepository.getApi($scope.api.name, $scope.api.version, true).then(function (api) {
                    $scope.api = api;
                });
            }, 500);
            $scope.showNewRestServiceForm = false;
            $scope.newService.doctrineResourceName = '';
            $scope.newService.doctrineEntityClass = '';
            $scope.newService.doctrinedoctrineObjectManager = 'doctrine.entitymanager.orm_default';
            $scope.newService.doctrinedoctrineHydrator = 'DoctrineModule\\Stdlib\\Hydrator\\DoctrineObject';
        }, function (response) {
        });
    };

(function(_, $) {'use strict';

angular.module('ag-admin').controller(
    'DoctrineAdapterController',
    ['$scope', '$location', 'flash', 'DoctrineAdapterResource', function ($scope, $location, flash, DoctrineAdapterResource) {
        $scope.doctrineAdapters = [];
        $scope.showNewDoctrineoctrinedapterForm = false;

        $scope.resetForm = function () {
            $scope.showNewDoctrineAdapterForm = false;
            $scope.adapterName = '';
            $scope.driver      = '';
            $scope.database    = '';
            $scope.username    = '';
            $scope.password    = '';
            $scope.hostname    = 'localhost';
            $scope.port        = '';
        };

        function updateDoctrineAdapters(force) {
            console.log('update');
            $scope.doctrineAdapters = [];
            DoctrineAdapterResource.fetch({force: force}).then(function (doctrineAdapters) {
                $scope.$apply(function () {
                    $scope.doctrineAdapters = _.pluck(doctrineAdapters.embedded.doctrine_adapter, 'props');
                    console.log('scope', $scope.doctrineAdapters );
                });
            });
        }
        updateDoctrineAdapters(false);

        $scope.saveDoctrineAdapter = function (index) {
            var doctrineAdapter = $scope.doctrineAdapters[index];
            var options = {
                driver      :  doctrineAdapter.params.driver,
                dbname      :  doctrineAdapter.params.dbname,
                user        :  doctrineAdapter.params.user,
                password    :  doctrineAdapter.params.password,
                host        :  doctrineAdapter.params.host,
                port        :  doctrineAdapter.params.port
            };
            DoctrineAdapterResource.saveAdapter(doctrineAdapter.adapter_name, options).then(function (doctrineAdapter) {
                flash.success = 'Doctrine adapter ' + doctrineAdapter.adapter_name + ' updated';
                updateDoctrineAdapters(true);
            });
        };

        $scope.removeDoctrineAdapter = function (adapter_name) {
            DoctrineAdapterResource.removeAdapter(adapter_name).then(function () {
                flash.success = 'Doctrine adapter ' + adapter_name + ' reset';
                updateDoctrineAdapters(true);
                $scope.deleteDoctrineAdapter = false;
            });
        };
    }]
);

})(_, $);

            return $http.post(moduleApiPath + '/' + apiName + '/doctrine', {adapter_name: dbAdapterName, table_name: dbTableName})
                .then(function (response) {
                    return response.data;
                });
        },

        createNewDoctrineConnectedService: function(apiName, doctrineResourceName, doctrineEntityClass, doctrineObjectManager, doctrineHydrator) {
            return $http.post(moduleApiPath + '/' + apiName + '/doctrine',
                {resourceName: doctrineResourceName, entityClass: doctrineEntityClass, objectManager: doctrineObjectManager, hydratorName: doctrineHydrator})
            .then(function (response) {
                return true;
            });
    };

    return resource;
}]);

})(_, Hyperagent);

(function(_, Hyperagent) {'use strict';

angular.module('ag-admin').factory(
    'DoctrineAdapterResource', 
    ['$http', '$q', '$location', 'apiBasePath', function ($http, $q, $location, apiBasePath) {

    var doctrineAdapterApiPath = apiBasePath + '/doctrine-adapter';

    var resource =  new Hyperagent.Resource(doctrineAdapterApiPath);
    
    resource.getList = function () {
        var deferred = $q.defer();

        this.fetch().then(function (adapters) {
            var doctrineAdapters = _.pluck(adapters.embedded.doctrine_adapter, 'props');
            deferred.resolve(doctrineAdapters);
        });

        return deferred.promise;
    };

    resource.saveAdapter = function (name, data) {
        return $http({method: 'patch', url: doctrineAdapterApiPath + '/' + encodeURIComponent(name), data: data})
            .then(function (response) {
                return response.data;
            });
    };

    resource.removeAdapter = function (name) {
        return $http.delete(doctrineAdapterApiPath + '/' + encodeURIComponent(name))