/**
*
* @licstart  The following is the entire license notice for the
*  JavaScript code in this page.
*
* This file is part of FIWARE CyberCAPTOR,
* instance of FIWARE Cyber Security Generic Enabler
* Copyright (C) 2012-2015  Thales Services S.A.S.,
* 20-22 rue Grande Dame Rose 78140 VELIZY-VILACOUBLAY FRANCE
*
* FIWARE CyberCAPTOR is free software; you can redistribute
* it and/or modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; either version 3 of the License,
* or (at your option) any later version.
*
* FIWARE CyberCAPTOR is distributed in the hope
* that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
* warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with FIWARE CyberCAPTOR.
* If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this page.
*
*/

/**
*   Graph Transformer
*   @param data
*
*   Converts the attack_graph from MulVAL in an appropriate (clean) format
*/
function transformGraph(data) {
    var sizeLinks = 0, sizeNodes = 0;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = 0;

    var graphAttackDatas = {
        links : [],
        nodes : []
    };            
 
    // Sort function
    Array.prototype.sortOn = function(key){
        this.sort(function(a, b){
            if(a[key] < b[key]){
                return -1;
            }else if(a[key] > b[key]){
                return 1;
            }
            return 0;
        });
    }

    // Retrieve sizes
    sizeLinks = data.attack_graph.arcs.arc.length;
    sizeNodes = data.attack_graph.vertices.vertex.length;

    // Matches our members with members of the links parameter
    for(var i=0; i < sizeLinks; ++i){
        var target = data.attack_graph.arcs.arc[i].dst;
        var source = data.attack_graph.arcs.arc[i].src;

        if(indexMatchTable[target] == null) {
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[source] == null) {
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    // Fills nodes with informations from our data
    for(var i=0; i < arrayNodesID.length; ++i) {
        for(var y=0; y<arrayNodesID.length; ++y){
             if(data.attack_graph.vertices.vertex[y].id == arrayNodesID[i]){
                var nodeAttackGraph = data.attack_graph.vertices.vertex[y];
                var corrected = "green";
                var nodeToAdd = {"ID" : nodeAttackGraph.id, "Fact" : nodeAttackGraph.fact, "Metric" : nodeAttackGraph.metric, "Type" : nodeAttackGraph.type, "Corrected": corrected};
                graphAttackDatas.nodes.push(nodeToAdd);
             }
         }
     }

    // Fills links with informations from our data
    for(var i=0; i < sizeLinks; ++i){
        var target = data.attack_graph.arcs.arc[i].dst;
        var source = data.attack_graph.arcs.arc[i].src;

        var link = {source: indexMatchTable[source], target: indexMatchTable[target]};
        graphAttackDatas.links.push(link);
    }

     graphAttackDatas.nodes.sortOn("ID");

    return graphAttackDatas;
}

// **************************************************
/**
*   Path Transformer
*   @param data
*   @param attackGraphData
*   @param $scope
*
*   Converts the attack path from MulVAL in an appropriate (clean) format
*/
function transformPath(data, attackGraphData, $scope){
    var scoring = 0, color, text;
    var sizeLinks = 0;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = 0;  

    var tabNodes = []; 

     var attackPathDatas = {
        links : [],
        nodes : [],
        scoring,
        color,
        text
    };                
  
    // Retrieve sizes
    sizeLinks = data.attack_path.arcs.arc.length;
    sizeNodes = attackGraphData.nodes.length;

    // Matches our members with members of the links parameter
    for(var i=0; i < sizeLinks; ++i){
        var target = data.attack_path.arcs.arc[i].dst;
        var source = data.attack_path.arcs.arc[i].src;

        if(indexMatchTable[target] == null) {
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[source] == null) {
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    for(var i=0; i < arrayNodesID.length; ++i){
        var nodeAttackGraph = attackGraphData.nodes[arrayNodesID[i]-1];
        var nodeToAdd = {"ID":nodeAttackGraph["ID"], "Fact":nodeAttackGraph["Fact"], "Metric":nodeAttackGraph["Metric"], "Type":nodeAttackGraph["Type"], "Corrected":nodeAttackGraph["Corrected"]};
        attackPathDatas.nodes.push(nodeToAdd);
    }

    // Matches our members with members of the links parameter
    for(var i=0; i < sizeLinks; ++i){
        var target = data.attack_path.arcs.arc[i].dst;
        var source = data.attack_path.arcs.arc[i].src;

        var link = {source: indexMatchTable[source], target: indexMatchTable[target]};
        attackPathDatas.links.push(link);
    }

    // Limit the score max at 1
    if(data.attack_path.scoring > 1) {
        data.attack_path.scoring = 1
    }

    attackPathDatas.scoring = data.attack_path.scoring;

   var attritionLevel = transformScoring(attackPathDatas.scoring);

   attackPathDatas.text = attritionLevel.text;
   attackPathDatas.color = attritionLevel.color;

   return attackPathDatas;
}


// **************************************************
/**
*   Score Transformer
*   @param data
*   @param $scope
*
*   Return the appropriate text and color for the gauge
*/
function transformScoring(data, $scope){
    var tabText = ["Negligible", "Minor", "Moderate", "Significant", "Severe"];
    var tabColor = ["green", "yellow", "orange", "red", "black"];
    var text, color;
    var array = {
        text,
        color
    };

    // For differents value of data, fix text and color
    if(data < 0.2){
        array.text = tabText[0];
        array.color = tabColor[0];
    }
    else if(data >= 0.2 && data < 0.4){
        array.text = tabText[1];
        array.color = tabColor[1];
    }
    else if(data >= 0.4 && data < 0.6){
        array.text = tabText[2];
        array.color = tabColor[2];
    }
    else if(data >= 0.6 && data < 0.8){
        array.text = tabText[3];
        array.color = tabColor[3];
    }
    else if(data >= 0.8 && data <= 1){
        array.text = tabText[4];
        array.color = tabColor[4];
    }
    else if(data > 1){
        array.text = tabText[4];
        array.color = tabColor[4];
    }
    else
    {
        array.text = "default";
        array.color = "black";
    }

    return array;
}


// **************************************************
/**
*   Remediation Transformer
*   @param data
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/
function transformRemediation(data){
    var remediations = [];    

    var sizeTab = data.remediations.remediation.length;

    for(var i=0; i < sizeTab; ++i){

        var cost = data.remediations.remediation[i].cost;
        var id = i;

        var size = data.remediations.remediation[i].remediation_actions.deployable_remediation.length;
        var DeployReme = [];

        // If deployable_remediation is an object
        if(size == undefined){
            var rule_patch = [];
            var action_object = {};

            var deployable_remediation = data.remediations.remediation[i].remediation_actions.deployable_remediation;
            var action = deployable_remediation.action;
            var type = action.type;
            var host = deployable_remediation.machine;

            var property = Object.getOwnPropertyNames(action);
            
            action_object["type"] = type;
            action_object["machine"] = host;

            //For "Patchs"
            if(type == "patch"){
                var patchs = [];
                var sizePatchs = action.patchs.length;

                if(sizePatchs == undefined){
                    var patch = action.patchs.patch;
                    rule_patch.push(patch);

                    action_object["action"] = rule_patch;
                    action_object["label"] = "Link";
                }
                else{
                    var patch = action.patchs.patch;
                    patchs.push(patch);

                    action_object["action"] = patchs;
                    action_object["label"] = "Link";
                    }
                }

                //For "Snort-Rules"
                else if(type == "snort-rules"){
                    var sizeRule = action.rules.rule.length;

                    if(sizeRule == undefined){
                        rule_patch = action.rules.rule;

                        action_object["action"] = rule_patch;
                        action_object["label"] = "Rule";
                    }
                    else{
                        rule_patch = action.rules.rule;

                        action_object["action"] = rule_patch;
                        action_object["label"] = "Rule";
                    }
            }          
            DeployReme.push(action_object);
        }
        // Deployable_Remediation => Array
        else{
            var rule_patch = [];
            var DeployReme = [];

            var sizeDepRem = data.remediations.remediation[i].remediation_actions.deployable_remediation.length;

            for(var a=0; a<sizeDepRem; ++a){

                var action_object = [];

                var action = data.remediations.remediation[i].remediation_actions.deployable_remediation[a].action;
                var type = action.type;
                var host = data.remediations.remediation[i].remediation_actions.deployable_remediation[a].machine;

                action_object["type"] = type;
                action_object["machine"] = host;

                // For "Firewall-Rule"
                if(type == "firewall-rule"){

                    var label = "Firewall-Rule";
                    var firewall_rule = [];
                    var firewallRule = action.rule;
                    firewall_rule.push(firewallRule);

                    rule_patch.push(firewall_rule);

                    action_object["label"] = label;
                    action_object["action"] = firewall_rule;

                    DeployReme.push(action_object);
                }
                // For "Patch"
                else if(type == "patch"){
                    var patchs = [];
                    var label = "Link";

                    var patch = action.patchs.patch;

                    patchs.push(patch);

                    action_object["label"] = label;
                    action_object["action"] = patchs;

                    DeployReme.push(action_object);
                 }
            }
        }

        var remediation = {Cost: cost, ID: id, DeployReme: DeployReme};

        remediations.push(remediation);
    }

    return remediations;
}


// **************************************************
/**
*   Topological Attack Path Transformer
*   @param data
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/

function transformPathTopo(data, attackGraphData, $scope){
    var label;
    var sizeLinks = 0, sizeNodes = 0;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = 0;   

     var attackPathDatas = {
        links : [],
        nodes : []
    };                

    // Retrieve sizes
    sizeLinks = data.arcs.arc.length;
    sizeNodes = data.vertices.vertex.length;

    // Matches our members with members of the links parameter
    for(var i=0; i < sizeLinks; ++i)
    {
        var target = data.arcs.arc[i].dst;
        var source = data.arcs.arc[i].src;
        label = data.arcs.arc[i].label;

        if(indexMatchTable[source] == null) {
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[target] == null) {
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    for(var i=0; i < arrayNodesID.length; ++i) {

        var nodeAttackGraph = data.vertices.vertex[arrayNodesID[i]];

        if(data.vertices.vertex[i].target == true){
            var icone = 0;
        }
        else if(data.vertices.vertex[i].source_of_attack == true){
            var icone = 1;
        }
        else if(data.vertices.vertex[i].compromised == true){
            var icone = 2;
        }

        var nodeToAdd = {"ID":nodeAttackGraph["id"], "Name":nodeAttackGraph["name"], "Type":nodeAttackGraph["type"], "Icone" : icone};
        attackPathDatas.nodes.push(nodeToAdd);
    }

    // Matches our members with members of the links parameter
    for(var i=0; i < sizeLinks; ++i)
    {
        var target = data.arcs.arc[i].dst;
        var source = data.arcs.arc[i].src;
        label = data.arcs.arc[i].label;

        var link = {source: source, target: target, label: label};
        attackPathDatas.links.push(link);
    }

   return attackPathDatas;
}

// **************************************************

/**
*   Topological Attack Graph Transformer
*   @param data
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/

function transformGraphTopo(data, $scope){
    var sizeLinks = 0, sizeNodes = 0;
    var arrayNodesID = [];
    var indexMatchTable = [];
    var incrMatchTable = [];

    var attackGraphDatas = {
        links : [],
        nodes : []
    };

    // Retrieve sizes
    sizeLinks = data.arcs.arc.length;
    sizeNodes = data.vertices.vertex.length;

    // Matches our members with members of the links parameter
    for(var i=0; i < sizeLinks; ++i)
    {
        var target = data.arcs.arc[i].dst;
        var source = data.arcs.arc[i].src;
        label = data.arcs.arc[i].label;

        if(indexMatchTable[target] == null) {
            arrayNodesID.push(target);
            indexMatchTable[target]=incrMatchTable;
            incrMatchTable += 1;
        }
        if(indexMatchTable[source] == null) {
            arrayNodesID.push(source);
            indexMatchTable[source]=incrMatchTable;
            incrMatchTable += 1;
        }
    }

    for(var i=0; i < arrayNodesID.length; ++i) {

        var nodeAttackGraph = data.vertices.vertex[arrayNodesID[i]];

        if(data.vertices.vertex[i].target == true){
            var icone = 0;
        }
        else if(data.vertices.vertex[i].source_of_attack == true){
            var icone = 1;
        }
        else if(data.vertices.vertex[i].compromised == true){
            var icone = 2;
        }

        var nodeToAdd = {"ID":nodeAttackGraph["id"], "Name":nodeAttackGraph["name"], "Type":nodeAttackGraph["type"], "Icone" : icone};
        attackGraphDatas.nodes.push(nodeToAdd);
    }

    // Matches our members with members of the links parameter
    for(var i=0; i < sizeLinks; ++i)
    {
        var target = data.arcs.arc[i].dst;
        var source = data.arcs.arc[i].src;
        label = data.arcs.arc[i].label;

        // var link = {source: indexMatchTable[source], target: indexMatchTable[target], label: label};
        var link = {source: source, target: target, label: label};
        attackGraphDatas.links.push(link);
    }

   return attackGraphDatas;
}

// **************************************************

/**
*   Topological Attack Graph Transformer
*   @param data
*
*   Converts remediations from MulVAL in an appropriate (clean) format.
*   Browses the JSON object from server and built another more appropriate
*       to work.
*/

function transformRemediationSimulation(basicGraph, newGraph, $scope){

    var sizeBasicGraph = basicGraph.nodes.length;
    var sizeNewGraph = newGraph.nodes.length;

    for(var i=0; i < sizeBasicGraph; ++i){
        for(var y=0; y < sizeNewGraph; ++y){
            if(basicGraph.nodes[i].Fact == newGraph.nodes[y].Fact){
               // newGraph.nodes[y].Fact = " ";
                basicGraph.nodes[i].Corrected = "black";   
            }
        }
        if(basicGraph.nodes[i].Corrected == "green"){
            console.log(basicGraph.nodes[i]);
        }
    }

    return basicGraph;
}