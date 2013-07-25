"use strict";angular.module("helpers",[]).factory("ramlPaser",function(){return RAML.Parser}).factory("ramlHelper",function(){return{toUriParams:function(object){var result="";for(var param in object)result=result+param+"="+object[param]+"&";return result.replace(/\&$/,";")},getUriPath:function(uri){var tempUri=uri.replate("//",""),pathStart=tempUri.indexOf("/");return tempUri.substr(pathStart)},getAbsoluteUri:function(baseUri,relativeUri){return baseUri+relativeUri},getRequestData:function(descriptor){var arr=[];if(descriptor.body)for(var contentType in descriptor.body){var temp={name:contentType,schema:descriptor.body[contentType].schema||"",example:descriptor.body[contentType].example||""};if(descriptor.body[contentType].formParameters){var params=[];for(var param in descriptor.body[contentType].formParameters){var t1=descriptor.body[contentType].formParameters[param];t1.name=param,params.push(t1)}temp.params=params}arr.push(temp)}else arr.push({name:"application/json",schema:"",example:"",params:[]});return arr},processQueryParts:function(query){var param,queryParams=[];for(var prop in query)param=query[prop],param.name=prop,queryParams.push(param);return queryParams},processUrlPartsNew:function(url){var urlParts=[],parts=url.split("}");return angular.forEach(parts,function(part){var splitted=(part||"").split("{");splitted.length&&urlParts.push({name:splitted[0],editable:!1}),2===splitted.length&&urlParts.push({name:"{"+splitted[1]+"}",editable:!0,memberName:splitted[1]})}),urlParts},processUrlParts:function(url){var urlParts=[],paths=url.split("/");return angular.forEach(paths,function(path){var template;path&&(template=path.match(/{(.*?)}/gi),template?urlParts.push({name:template[0],editable:!0,memberName:template[0].replace("{","").replace("}","")}):urlParts.push({name:path,editable:!1}))}),urlParts},massage:function(resource,parent){if(resource.use=this.readTraits(resource.use),resource.name||(resource.name=resource.relativeUri),resource.resources){var temp=JSON.parse(JSON.stringify(resource));delete temp.resources,temp.relativeUri="",temp.methods&&resource.resources.unshift(temp),angular.forEach(resource.resources,function(r){r.name||(r.name=r.relativeUri),r.relativeUri=resource.relativeUri+r.relativeUri;var exists=null;parent&&parent.resources&&(exists=parent.resources.filter(function(p){return p.name===r.name}.bind(this)).pop()),parent&&!exists&&parent.resources.push(r),this.massage(r,resource)}.bind(this))}else{var exists=!1;parent&&(exists=parent.resources.filter(function(p){return p.name===p.name}.bind(this)).pop()),parent&&!exists&&parent.resources.push(resource)}if(!parent){var res=JSON.parse(JSON.stringify(resource));if(resource.resources){var flag=resource.resources.filter(function(p){return p.name===p.name}.bind(this)).pop();if(!flag){var tt=JSON.Parse(JSON.stringify(resource));delete res.resources,resource.resources.push(tt)}}else resource.resources=[],resource.resources.push(res)}},readTraits:function(usages){var temp=[];return usages&&angular.forEach(usages,function(use){if("string"==typeof use&&-1===temp.indexOf(use))temp.push(use);else if("object"==typeof use){var keys=Object.keys(use);if(keys.length){var key=Object.keys(use)[0];-1===temp.indexOf(key)&&temp.push(key)}}}),temp}}}).factory("commons",function(){return{extend:function(destination,source){for(var elem in source)source.hasOwnProperty(elem)&&(destination[elem]=source[elem]);return destination},joinUrl:function(url1,url2){return url1.lastIndexOf("/")===url1.length-1&&(url1=url1.substring(0,url1.lastIndexOf("/"))),0!==url2.indexOf("/")&&(url2="/"+url2),url1+url2},resolveParams:function(urlTemplate,params){return params&&params.forEach(function(p){p.value&&(urlTemplate=urlTemplate.replace(p.name,p.value))}),urlTemplate},makeReadyStateHandler:function(xhr,callback){xhr.onreadystatechange=function(){4===xhr.readyState&&callback&&callback.call(null,xhr.responseText,xhr)}},setRequestHeaders:function(xhr,headers){if(headers)for(var name in headers)xhr.setRequestHeader(name,headers[name])},toQueryString:function(params){var r=[];for(var n in params){var v=params[n];n=encodeURIComponent(n),r.push(null==v?n:n+"="+encodeURIComponent(v))}return r.join("&")},request:function(options){var xhr=new XMLHttpRequest,url=options.url,method=options.method||"GET",async=!options.sync,params=this.toQueryString(options.params);return params&&"GET"===method&&(url+=(url.indexOf("?")>0?"&":"?")+params),xhr.open(method,url,async),this.makeReadyStateHandler(xhr,options.callback),this.setRequestHeaders(xhr,options.headers),xhr.send("POST"===method||"PUT"===method?options.body||params:null),async||xhr.onreadystatechange(xhr),xhr}}}).filter("formatUriPart",function(){return function(text){return text.replace("\\","")}}),angular.module("helpers").factory("showdown",function(){var showdown=new Showdown.converter;return showdown}),angular.module("helpers").factory("eventService",function($rootScope){var sharedService={};return sharedService.broadcast=function(eventName,data){$rootScope.$broadcast(eventName,data)},sharedService}),angular.module("ramlConsoleApp",["helpers","raml","ngResource","ngSanitize"]),angular.module("raml",[]).factory("ramlReader",function(){return{readRootElements:function(raml){var result={};if("undefined"==typeof raml.title)throw new Error("title is not defined");if(result.title=raml.title,"undefined"==typeof raml.baseUri)throw new Error("baseUri is not defined");return result.baseUri=raml.baseUri,"undefined"!=typeof raml.version&&(result.version=raml.version),result},readDocumentation:function(raml){var result={};return"undefined"!=typeof raml.documentation&&(result.documentation=raml.documentation),result},convert:function(query){var param,queryParams=[];for(var prop in query)param=query[prop],param.name=prop,queryParams.push(param);return queryParams},readHttpMethodData:function(methodDescriptor){var result={};if("undefined"!=typeof methodDescriptor.method&&(result.name=methodDescriptor.method),"undefined"!=typeof methodDescriptor.summary&&(result.summary=methodDescriptor.summary),"undefined"!=typeof methodDescriptor.responses){result.responses=methodDescriptor.responses;for(var prop in result.responses)null===result.responses[prop]&&(result.responses[prop]=prop)}return"undefined"!=typeof methodDescriptor.queryParameters&&(result.queryParameters=[],angular.forEach(methodDescriptor.queryParameters,function(){result.queryParameters=this.convert(methodDescriptor.queryParameters)}.bind(this))),"undefined"!=typeof methodDescriptor.uriParameters&&(result.uriParameters=methodDescriptor.uriParameters),"undefined"!=typeof methodDescriptor.body&&(result.request=methodDescriptor.body),result},readContentTypes:function(methodDescriptor){var types=["application/json"];if("undefined"!=typeof methodDescriptor.body)for(var type in methodDescriptor.body)-1===types.indexOf(type)&&types.push(type);return"undefined"!=typeof methodDescriptor.responses&&angular.forEach(methodDescriptor.responses,function(element){for(var httpCode in element)for(var contentType in methodDescriptor.responses[httpCode])-1===types.indexOf(contentType)&&types.push(contentType)}),types},readTraits:function(resource){var traits=[];return angular.forEach(resource.use,function(use){if("string"==typeof use&&-1===traits.indexOf(use))traits.push(use);else if("object"==typeof use){var keys=Object.keys(use);if(keys.length){var key=Object.keys(use)[0];-1===traits.indexOf(key)&&traits.push(key)}}}),traits},readResourceData:function(resource,baseUri){var result=JSON.parse(JSON.stringify(resource));if(!resource.methods instanceof Array&&delete result.methods,"undefined"==typeof result.name&&(result.name=result.relativeUri),"undefined"==typeof result.relativeUri)throw new Error("relativeUri is not defined");return"undefined"!=typeof resource.methods&&resource.methods instanceof Array&&(result.methods={},angular.forEach(resource.methods,function(element){result.methods[element.method]=this.readHttpMethodData(element),result.methods[element.method].supportedTypes=this.readContentTypes(element)}.bind(this))),"undefined"!=typeof resource.use&&(result.traits=this.readTraits(resource)),result.absoluteUri=baseUri+result.relativeUri,result},readRootResources:function(raml){var result={resources:[]};return"undefined"!=typeof raml.resources&&angular.forEach(raml.resources,function(element){result.resources.push(this.readResourceData(element,raml.baseUri))}.bind(this)),result},read:function(raml){var result,rootResources=this.readRootResources(raml),rootDocumentation=this.readDocumentation(raml);return angular.forEach(rootResources.resources,function(resource){var flatResources=this.flatten(resource);delete resource.resources,resource.resources=[],angular.forEach(flatResources,function(el){var r=this.readResourceData(el,raml.baseUri);resource.resources.push(r)}.bind(this))}.bind(this)),result=this.readRootElements(raml),result.documentation=rootDocumentation.documentation,result.resources=rootResources.resources,result},flatten:function(resource,container){var temp,result=[],uriPart=resource.relativeUri;return"undefined"==typeof container?(temp=JSON.parse(JSON.stringify(resource)),delete temp.resources,"undefined"!=typeof temp.methods&&(result=[temp])):result=container,"undefined"==typeof resource.resources&&(resource.resources=[]),resource.resources.length>0?(angular.forEach(resource.resources,function(el){return temp=JSON.parse(JSON.stringify(el)),delete temp.resources,temp.relativeUri=uriPart+temp.relativeUri,el.relativeUri=temp.relativeUri,result.push(temp),this.flatten(el,result)}.bind(this)),result):result}}}),angular.module("ramlConsoleApp").directive("preventDefault",function(){return function(scope,element){var preventDefaultHandler=function(event){event.preventDefault(),event.stopPropagation(),event.stopImmediatePropagation()};element[0].addEventListener("click",preventDefaultHandler,!1)}}).directive("scrollToIf",function(){return function(scope,element,attrs){var scrollToHandler=function(event){function smoothScroll(){-1!==partialOffset&&(targetOffset>currentOffset&&(partialOffset+=scrollLeap,partialOffset=partialOffset>targetOffset?targetOffset:partialOffset),currentOffset>targetOffset&&(partialOffset-=scrollLeap,partialOffset=targetOffset>partialOffset?targetOffset:partialOffset),window.scrollTo(0,partialOffset),partialOffset=partialOffset===targetOffset?-1:partialOffset,requestAnimationFrame(smoothScroll))}var partialOffset,elem=event.target,targetOffset=elem.offsetTop,currentOffset=window.scrollY,scrollLeap=80;if(scope.$eval(attrs.scrollToIf)){for(;elem;)elem=elem.offsetParent,elem&&elem.attributes["scroll-to-if"]&&(targetOffset=0),targetOffset+=elem?elem.offsetTop:0;targetOffset-=10,targetOffset!==currentOffset&&(partialOffset=currentOffset,requestAnimationFrame(smoothScroll))}};element[0].addEventListener("click",scrollToHandler,!1)}}),angular.module("ramlConsoleApp").directive("ramlConsole",function($rootScope){return{restrict:"E",templateUrl:"views/raml-console.tmpl.html",replace:!0,transclude:!1,scope:{id:"@",definition:"@"},link:function($scope){$scope.resources=[],$rootScope.$on("event:raml-parsed",function(e,args){var baseUri=(args.baseUri||"").replace(/\/\/*$/g,""),version=args.version||"";baseUri=baseUri.replace(":0","\\:0"),baseUri=baseUri.replace(":1","\\:1"),baseUri=baseUri.replace(":2","\\:2"),baseUri=baseUri.replace(":3","\\:3"),baseUri=baseUri.replace(":4","\\:4"),baseUri=baseUri.replace(":5","\\:5"),baseUri=baseUri.replace(":6","\\:6"),baseUri=baseUri.replace(":7","\\:7"),baseUri=baseUri.replace(":8","\\:8"),baseUri=baseUri.replace(":9","\\:9"),$scope.baseUri=baseUri.replace("{version}",version),$scope.resources=args.resources,$scope.documentation=args.documentation,$scope.$apply()})}}}),angular.module("ramlConsoleApp").directive("ramlDefinition",function($rootScope){return{restrict:"E",templateUrl:"views/raml-definition.tmpl.html",replace:!0,transclude:!1,scope:{id:"@",src:"@"},controller:function($scope,$element,$attrs,ramlPaser,ramlReader){ramlPaser.loadFile($attrs.src).done(function(result){var readData=ramlReader.read(result);console.log(readData),$rootScope.$emit("event:raml-parsed",readData)})}}}),angular.module("ramlConsoleApp").directive("markdown",function(showdown){return{restrict:"C",link:function($scope,element,attrs){$scope.$watch(attrs.ngModel,function(value){"undefined"!=typeof value&&element.html(showdown.makeHtml(value))})}}}),angular.module("ramlConsoleApp").controller("ramlOperation",function($scope,$filter,ramlHelper){$scope.headerClick=function(){this.toggle("active")},$scope.changeMethod=function(methodName){var method=this.resource.methods[methodName],uri=ramlHelper.getAbsoluteUri(this.baseUri,this.resource.relativeUri);method&&($scope.operation=method,$scope.urlParams=ramlHelper.processUrlPartsNew(uri),$scope.queryParams=this.operation.queryParameters,$scope.contentType=this.operation.supportedTypes[0])},$scope.isMethodActive=function(methodName){return this.operation&&this.operation.name===methodName},$scope.toggle=function(member){this[member]=!this[member]},$scope.init=function(){this.resource.methods!=={}&&this.changeMethod(Object.keys(this.resource.methods)[0])},$scope.init()}),angular.module("ramlConsoleApp").controller("ramlOperationList",function($scope){$scope.model={},$scope.$on("event:raml-sidebar-clicked",function(e,eventData){$scope.model=eventData.isResource?eventData.data:{}})}),angular.module("ramlConsoleApp").controller("ramlDocumentation",function($scope){$scope.model={},$scope.$on("event:raml-sidebar-clicked",function(e,eventData){$scope.model=eventData.isDocumentation?eventData.data[0]:{}})}),angular.module("ramlConsoleApp").controller("ramlConsoleSidebar",function($scope,$filter,eventService,$rootScope){var broadcast=function(data,isDoc,isRes){var result={data:data,isDocumentation:isDoc,isResource:isRes};$rootScope.elementName=data.name||(data[0]?data[0].title:data.relativeUri),$rootScope.type=isDoc&&!isRes?"document":"resource",eventService.broadcast("event:raml-sidebar-clicked",result)};$rootScope.elementName="",$rootScope.type="",$scope.loaded=function(doc,res){"undefined"!=typeof doc?broadcast([doc],!0,!1):"undefined"!=typeof res&&broadcast(res,!1,!0)},$scope.elementClick=function(id){var data=this.resource||this.documentation;broadcast($filter("filter")(data,function(el){return el.name===id||el.title===id}),this.documentation?!0:!1,this.resource?!0:!1)},$scope.isElementActive=function(elementName,type){return elementName===$rootScope.elementName&&type===$rootScope.type}}),angular.module("ramlConsoleApp").controller("ramlOperationDetails",function($scope,eventService){$scope.parseTypeName=function(value){var split=value.split("/");return split.length>=2?split[1]:split},$scope.hasSummary=function(value){return!("undefined"!=typeof value&&""!==value)},$scope.initTabs=function(){this.tabs||(this.tabs=[],this.tabs.push({name:"try-it",displayName:"Try It",view:"views/raml-operation-details-try-it.tmpl.html",show:function(){return!0}}),this.tabs.push({name:"parameters",displayName:"Parameters",view:"views/raml-operation-details-parameters.tmpl.html",show:function(){return"undefined"!=typeof $scope.operation.queryParameters}}),this.tabs.push({name:"requests",displayName:"Request",view:"views/raml-operation-details-request.tmpl.html",show:function(){return"undefined"!=typeof $scope.operation.request}}),this.tabs.push({name:"response",displayName:"Response",view:"views/raml-operation-details-response.tmpl.html",show:function(){return"undefined"!=typeof $scope.operation.responses}}),this.tabName=this.tabs[0].name)},$scope.$on("event:raml-method-changed",function(){$scope.init()}),$scope.isTabActive=function(tabName){return tabName===$scope.tabName},$scope.isTypeActive=function(mediaType){return mediaType===$scope.contentType},$scope.changeTab=function(tabName){$scope.tabName=tabName},$scope.requestFilter=function(el){return el.method===$scope.operation.method&&"undefined"!=typeof el.body&&"undefined"!=typeof el.body[$scope.bodyType.name]},$scope.changeBodyType=function(mediaType){$scope.contentType=mediaType,eventService.broadcast("event:raml-body-type-changed",mediaType)},$scope.responseFilter=function(el){return el.name===$scope.operation.name&&"undefined"!=typeof el.responses},$scope.initTabs()}),angular.module("ramlConsoleApp").controller("ramlOperationDetailsTryIt",function($scope,$resource,commons,eventService,ramlHelper){$scope.hasAdditionalParams=function(operation){return operation.queryParameters||"post"===operation.name||"put"===operation.name},$scope.hasRequestBody=function(operation){return"post"===operation.name||"put"===operation.name},$scope.hasBodyParams=function(bodyType){return bodyType&&bodyType.params&&bodyType.params.length},$scope.showResponse=function(){return this.response},$scope.tryIt=function(){var params={},tester=new this.testerResource,bodyParams=this.hasBodyParams(this.bodyType)?this.body[this.operation.name]:null,body=this.hasRequestBody(this.operation)?this.requestBody[this.operation.name]:null;body=bodyParams?ramlHelper.toUriParams(bodyParams):body,commons.extend(params,this.url),commons.extend(params,this.query[this.operation.name]),tester.body=body||null,this.response=null,this.$request(tester,params,this.operation.name)},$scope.$request=function(tester,params,method){var that=this;tester["$"+method](params,function(data,headers,status,url){that.response={data:data.data,headers:data.headers,statusCode:status,url:url}},function(error){var params=ramlHelper.toUriParams(error.config.params).replace(";","");that.response={data:error.data.data,headers:error.data.headers,statusCode:error.status,url:error.config.url+"?"+params}})},$scope.transformResponse=function(data,headers){try{data=JSON.parse(data),data=angular.toJson(data,!0)}catch(e){}return{data:data,headers:headers()}},$scope.transformRequest=function(data){return data&&data.body?data.body:null},$scope.buildTester=function(){var resourceUri=this.baseUri.replace(/{/g,":").replace(/}/g,"")+this.resource.relativeUri.replace(/{/g,":").replace(/}/g,""),contentType=$scope.contentType;this.testerResource=$resource(resourceUri,null,{get:{method:"GET",headers:{accept:contentType},transformResponse:this.transformResponse,transformRequest:this.transformRequest},post:{method:"POST",headers:{"content-type":contentType,accept:contentType},transformResponse:this.transformResponse,transformRequest:this.transformRequest},put:{method:"PUT",headers:{"content-type":contentType,accept:contentType},transformResponse:this.transformResponse,transformRequest:this.transformRequest},"delete":{method:"DELETE",headers:{accept:contentType},transformResponse:this.transformResponse,transformRequest:this.transformRequest}})},$scope.init=function(){this.request||(this.request={}),this.requestBody||(this.requestBody={put:"",post:""}),this.body||(this.body={put:{},post:{}}),this.url||(this.url={}),this.query||(this.query={get:{},put:{},post:{},"delete":{}}),this.response=null,this.buildTester()},$scope.$on("event:raml-method-changed",function(){$scope.init()}),$scope.$on("event:raml-body-type-changed",function(){$scope.init()}),$scope.init()}),angular.module("ramlConsoleApp").controller("ramlOperationDetailsResponse",function($scope){$scope.parseTypeName=function(value){var split=value.split("/");return split.length>=2?split[1]:split}}),angular.module("ramlConsoleApp").controller("ramlOperationDetailsRequest",function($scope){$scope.parseTypeName=function(value){var split=value.split("/");return split.length>=2?split[1]:split}}),angular.module("ramlConsoleApp").run(["$templateCache",function($templateCache){$templateCache.put("views/raml-body-param.tmpl.html",'<label>{{bodyParam.name}}\n    <input type="text" placeholder="{{bodyParam.example}}" ng-model="body[operation.method][bodyParam.name]">\n</label>'),$templateCache.put("views/raml-console-navbar.tmpl.html","<header>\n    <h1>api:<em>Console</em></h1>\n    <span>{{api.title}} {{api.version}}</span>\n</header>"),$templateCache.put("views/raml-console-sidebar.tmpl.html",'<div ng-controller="ramlConsoleSidebar">\n  <section role="documentation" ng-if="documentation.length">\n    <header>\n      <h1>Overview</h1>\n    </header>\n    <ul role="documentation">\n      <li ng-class="{active:isElementActive(document.title, \'document\')}" ng-repeat="document in documentation">\n        <a href="#" ng-click="elementClick(document.title)">{{document.title}}</a>\n      </li>\n    </ul>\n  </section>\n  <section role="resources" ng-if="resources.length">\n    <header>\n      <h1>Api Reference</h1>\n    </header>\n    <ul>\n      <li ng-class="{active:isElementActive(resource.name, \'resource\')}" ng-repeat="resource in resources">\n        <a href="#" ng-click="elementClick(resource.name)">{{resource.name}}</a>\n      </li>\n    </ul>\n  </section>\n</div>'),$templateCache.put("views/raml-console.tmpl.html",'<section role="api-console">\n    <header>\n        <ng-include src="\'views/raml-console-navbar.tmpl.html\'"></ng-include>\n    </header>\n    <aside role="sidebar">\n        <ng-include src="\'views/raml-console-sidebar.tmpl.html\'" onload="loaded(documentation[0], resources[0])" ng-controller="ramlConsoleSidebar"></ng-include>\n    </aside>\n    <section role="main">\n        <ng-include src="\'views/raml-documentation.tmpl.html\'" ng-controller="ramlDocumentation"></ng-include>\n        <ng-include src="\'views/raml-operation-list.tmpl.html\'"></ng-include>\n    </section>\n</section>\n'),$templateCache.put("views/raml-definition.tmpl.html","<div></div>"),$templateCache.put("views/raml-documentation.tmpl.html",'<section role="api-documentation" ng-show="model">\n  <header>\n    <h1>{{model.title}}</h1>\n  </header>\n  <div id="content" class="markdown" ng-model="model.content">\n  </div>\n</section>'),$templateCache.put("views/raml-operation-details-parameters.tmpl.html",'<section role="api-operation-details-section-parameters">\n  <section role="parameter-list" ng-show="(urlParams | filter: {editable: true}).length">\n    <header>\n      <h1>Url Parameters</h1>\n    </header>\n    <table>\n      <thead>\n        <tr>\n          <th>Param</th>\n          <th>Type</th>\n          <th>Description</th>\n          <th>Example</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr ng-repeat="param in urlParams | filter: {editable: true}">\n          <td>{{param.name}}</td>\n          <td>{{param.type}}</td>\n          <td>{{param.description}}</td>\n          <td>{{param.example}}</td>\n        </tr>\n      </tbody>\n    </table>\n  </section>\n  <section role="parameter-list" ng-show="queryParams.length">\n    <header>\n      <h1>Query Parameters</h1>\n    </header>\n    <table>\n      <thead>\n        <tr>\n          <th>Param</th>\n          <th>Type</th>\n          <th>Description</th>\n          <th>Example</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr ng-repeat="param in queryParams">\n          <td>{{param.name}}</td>\n          <td>{{param.type}}</td>\n          <td>{{param.description}}</td>\n          <td>{{param.example}}</td>\n        </tr>\n      </tbody>\n    </table>\n  </section>\n</section>\n'),$templateCache.put("views/raml-operation-details-request.tmpl.html",'<section role="api-operation-details-section-request" ng-controller="ramlOperationDetailsRequest">\n   <section role="codes-list" ng-repeat="(contentType, content) in operation.request">\n    <table ng-show="content.schema">\n      <thead>\n        <tr>\n          <th>{{ parseTypeName(contentType) }} Schema</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td>\n        <pre>{{content.schema}}</pre>\n      </td>\n        </tr>\n      </tbody>\n    </table>\n\n    <table ng-show="content.example">\n      <thead>\n        <tr>\n          <th>{{ parseTypeName(contentType) }} Example</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td>\n        <pre>{{content.example}}</pre>\n      </td>\n        </tr>\n      </tbody>\n    </table>\n\n  </section>\n\n  <section role="codes-list" ng-repeat="(contentType, content) in operation.request" ng-show="content.formParameters">\n    <header>\n      <h1>Form Parameters</h1>\n    </header>\n    <table>\n      <thead>\n        <tr>\n          <th>Name</th>\n          <th>Type</th>\n          <th>Description</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr ng-repeat="param in content.formParameters">\n          <td>{{param.name}}</td>\n          <td>{{param.type}}</td>\n          <td>{{param.description}}</td>\n        </tr>\n      </tbody>\n    </table>\n  </section>\n</section>\n'),$templateCache.put("views/raml-operation-details-response.tmpl.html",'<section role="api-operation-details-section-response" ng-controller="ramlOperationDetailsResponse">\n  <section role="codes-list" ng-repeat="(statusCode, response) in operation.responses">\n    <header>\n      <h1>{{statusCode}}</h1>\n      <p>{{response.description}}</p>\n    </header>\n\n    <table ng-show="content.schema" ng-repeat="(contentType, content) in response.body">\n      <thead>\n        <tr>\n          <th>{{ parseTypeName(contentType) }} Schema</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td>\n        <pre>{{content.schema}}</pre>\n      </td>\n        </tr>\n      </tbody>\n    </table>\n\n    <table ng-show="content.example" ng-repeat="(contentType, content) in response.body">\n      <thead>\n        <tr>\n          <th>{{ parseTypeName(contentType) }} Example</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td>\n        <pre>{{content.example}}</pre>\n      </td>\n        </tr>\n      </tbody>\n    </table>\n\n  </section>\n</section>\n'),$templateCache.put("views/raml-operation-details-try-it.tmpl.html",'<section role="api-operation-details-section-try-it" ng-controller="ramlOperationDetailsTryIt">\n    <section role="request">\n        <header>\n            <h1>Request</h1>\n        </header>\n        <div role="uri-params">\n            <h2>Resource Uri</h2>\n            <div role="uri">\n                <ng-include src="\'views/raml-uri-part.tmpl.html\'" ng-repeat="uriPart in urlParams"></ng-include>\n            </div>\n        </div>\n        <div role="additional-params" ng-show="hasAdditionalParams(operation)">\n            <div role="query-params">\n                <h2>Additional parameters</h2>\n                <div role="params">\n                    <ng-include src="\'views/raml-query-param.tmpl.html\'" ng-repeat="queryParam in queryParams"></ng-include>\n                </div>\n                <div role="params">\n                    <ng-include src="\'views/raml-body-param.tmpl.html\'" ng-repeat="bodyParam in operation.request[contentType].formParameters"></ng-include>\n                </div>\n            </div>\n            <div role="request-body" ng-show="hasRequestBody(operation) && !hasBodyParams(bodyType)">\n                <label>Body\n                    <textarea ng-model="requestBody[operation.method]"></textarea>\n                </label>\n            </div>\n        </div>\n        <div role="try-it">\n            <span ng-click="tryIt()">Try It!</span>\n        </div>\n    </section>\n    <section role="response" ng-show="showResponse()">\n        <header>\n            <h1>Response</h1>\n        </header>\n        <section role="request-uri">\n            <h1>Request URL</h1>\n            <p>{{response.url}}</p>\n        </section>\n        <section role="response-code">\n            <h1>Response code</h1>\n            <p>{{response.statusCode}}</p>\n        </section>\n        <section role="response-headers">\n            <h1>Response headers</h1>\n            <ul role="headers-list">\n                <li ng-repeat="(key, value) in response.headers">\n                    <span role="key">{{key}}</span>\n                    <span role="value">{{value}}</span>\n                </li>\n                <!-- Uncomment when this feature is ready in Angular release\n                <dl>\n                  <dt ng-repeat-start="(key, value) in response.headers">{{key}}</dt>\n                  <dd ng-repeat-end>{{value}}</dd>\n                </dl>\n                -->\n            </ul>\n        </section>\n        <section role="response-body">\n            <h1>Response body</h1>\n            <p>\n                <pre>{{response.data}}</pre>\n            </p>\n        </section>\n    </section>\n</section>\n'),$templateCache.put("views/raml-operation-details.tmpl.html",'<section role="api-operation-details" ng-show="operation" ng-controller="ramlOperationDetails">\n  <header>\n      <h1>Summary</h1>\n      <p>{{operation.summary}}</p>\n      <p ng-if="hasSummary(operation.summary)">No summary.</p>\n  </header>\n  <div role="details-body">\n    <ul role="details-sections">\n        <li role="{{tab.name}}"\n            ng-repeat="tab in tabs"\n            ng-class="{active:isTabActive(tab.name)}"\n            ng-click="changeTab(tab.name)"\n            ng-show="tab.show()">\n          <span>{{tab.displayName}}</span>\n        </li>\n    </ul>\n    <ul role="content-types">\n        <li ng-repeat="contenType in operation.supportedTypes"\n            ng-click="changeBodyType(contenType)" ng-class="{active:isTypeActive(contenType)}">\n          {{ parseTypeName(contenType)}}\n        </li>\n    </ul>\n    <ng-include ng-repeat="tab in tabs"\n                ng-show="isTabActive(tab.name)"\n                src="tab.view">\n    </ng-include>\n  </div>\n</section>\n'),$templateCache.put("views/raml-operation-list.tmpl.html",'<div ng-show="model" ng-controller="ramlOperationList">\n  <header ng-show="topResource">\n    {{model}}\n    <h1>{{model.name}}</h1>\n  </header>\n  <section role="api-operation-list">\n    <ng-include src="\'views/raml-operation.tmpl.html\'" ng-repeat="resource in model.resources"></ng-include>\n  </section>\n</div>'),$templateCache.put("views/raml-operation.tmpl.html",'<section role="api-operation" ng-class="{active:active, first:$first, last:$last}" ng-controller="ramlOperation" scroll-to-if="active">\n  <header id="operationHeader" ng-click="headerClick()">\n    <hgroup>\n      <h1>{{resource.name}}</h1>\n      <h2>{{resource.relativeUri}}</h2>\n    </hgroup>\n    <div role="summary">\n      <ul role="traits">\n        <li ng-repeat="trait in resource.traits">{{trait}}</li>\n      </ul>\n      <ul role="operations">\n        <li role="{{key}}" ng-repeat="(key, value) in resource.methods" ng-class="{active:isMethodActive(key)}" ng-click="changeMethod(key)" prevent-default>\n          <span>{{key}}</span>\n        </li>\n      </ul>\n    </div>\n  </header>\n  <ng-include src="\'views/raml-operation-details.tmpl.html\'"></ng-include>\n</scection>'),$templateCache.put("views/raml-query-param.tmpl.html",'<label>{{queryParam.name}}\n    <input type="text" placeholder="{{queryParam.example}}" ng-model="query[operation.name][queryParam.name]">\n</label>'),$templateCache.put("views/raml-uri-part.tmpl.html",'<span ng-hide="uriPart.editable" ng-bind-html=\'uriPart.name | formatUriPart\'></span><input type="text" ng-model="url[uriPart.memberName]" ng-show="uriPart.editable" placeholder="{{uriPart.name}}"></input>')}]);