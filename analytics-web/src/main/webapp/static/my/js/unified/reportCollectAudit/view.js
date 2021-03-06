define(function(require, exports, module) {
	var model = require("./model");
	var rm = require("./rm");
	var constants = require("my/js/utils/constants");
	var view = Backbone.View.extend({
		el: "div.main-container",
		initialize:function(){
			this.model=new model();
			this.render();
		},
		events:{
			"click button[role='summarize']":"summarizeReport",//汇总
			"click button[role='release']":"releaseReport",
			"click button[role='download']":"submitQuery",
			"click button[role='btn-concel-detail']":"concel",//退回窗口关闭
			"click button[role='close-detail']":"closedetail",
			"click button[role='detail']":"openDetail",//查看意见记录
			"click button[role='resend']":"resendWindow",//退回重发窗口
			"click #resendCommentsSubmit":"resendCommentsSubmit",//退回重发
			"click #summarizeResult":"summarizeResult"//查看汇总按钮
		},
		render:function(){
			this.initTemplateTable();
			this.initDataTables();
			this.initTimeLine();
			this.initButton();
			//this.initCommentList();//意见记录
			this.audit();
			this.selectAll();
			this.clickFunction();
			//this.initReleaseButton();
			this.ifShowSummarizeResult();//是否显示"查看汇总"按钮
			this.ifShowSelectAll();//是否显示"全选"复选框
		},
		ifShowSelectAll : function(){
			$.ajax({
				type : "POST",
				url : $$ctx + "/dataSummarize/ifShowSelectAll",
				data : {
					workflowId : $("#workflowId").val(),
				},
				success : function(result){
					if(result=="0"){
						$("#cusmanager_ck_all").remove();
					}
				}
			});
		},
		ifShowSummarizeResult : function(){
			var templateSumId = $("#templateSumId").val();
			if(templateSumId == "0"){
				$("#summarizeResult").attr("style","display:none!important");
			}
			if(templateSumId != "0"){
				$("#summarizeResult").attr("style","display: !important");
			}
		},
		openDetail : function(e){
			var viewSelf = this;
			var $btn=$(e.currentTarget);//获得当前操作按钮
			var curOrgId = $btn.data('orgid');
			console.log(curOrgId);
			viewSelf.initCommentList(curOrgId);
			$("#detailModal").modal("show");
		},
		resendWindow : function(f){
    		var $btn = $(f.currentTarget);
//    		$("#tbl_cusmanager button[role=resend]").attr("disabled", true);
//    		$btn.attr("disabled", true);
    		var orgId = $btn.data("orgid");
        	var submitTimeElement = "subTime"+$btn.data("id");
        	var submitTime = $("#"+submitTimeElement).html();//2015-07-28
        	
        	$("#curOrgId").val(orgId);
        	$("#submitTime").val(submitTime);
        	
        	$("#lookTemplate").modal("show");
        	$("#resendCommentsSubmit").attr("disabled", false);
        	
	        
    	},
    	resendCommentsSubmit : function(){
    		var viewSelf = this;
    		var orgId = $("#curOrgId").val();
    		var submitTime = $("#submitTime").val();
        	$("#resendCommentsSubmit").attr("disabled", true);
        	
        	if($("#resendComments").val() != ''){
	        	var parameterJosn = {
        			workflowCode: $("#workflowCode").val(),
					workflowId: $("#workflowId").val(),
					nodeId: $("#nodeId").val(),
					wfTaskId: $("#wfTaskId").val(),
					actionCode: "1",
					comments: $("#resendComments").val(),
                    orgId: orgId,
                    templateId: $("#no").val(),
                    submitTime: submitTime,
	        	};
	        	viewSelf.model.resend(parameterJosn, function(result) {
	                if (result.success) {
	                    bootbox.alert("提交成功!", function() {
	                        //window.parent.denyAudit();
	                    	window.opener.winOperate();
	    					window.close();
	                        //$("#proxyIFrame").attr("src", constants.portalLoginUrl + "/iframe?" + new Date().getTime());
	                    });
	                } else {
	                    bootbox.alert("提交失败,请稍后重试");
	                }
	            });
        	}else{
        		bootbox.alert("请输入退回意见");
        		$("#tbl_cusmanager button[role=resend]").attr("disabled", false);
        	}
    	},
		initDataTables : function(){
        	var viewSelf = this;
        	var workflowId = $("#workflowId").val();
        	
			var cusManagerTable = $("#tbl_cusmanager").dataTable({
				bServerSide: true,
				bFilter: false,
				bLengthChange: false,
				bSort: false,
				ajax: {
					type: "POST",
					url: $$ctx + "/dataSummarize/findAll",
					data:{
			    		workflowId : $("#workflowId").val(),//workflowId
			    		length:30
					},
				},
				columns: [
					{data: "id", mRender : function(data, type, rowdata) {
						if($.trim(rowdata.submitState) == '1'){
							return "<input type='checkbox' value='" + rowdata.id + "' name='cusmanager_ck_id' id='cusmanager_ck_id' />";
						}else{
							return "<input type='hidden' value='" + rowdata.id + "' name='cusmanager_ck_id_hidden' id='cusmanager_ck_id_hidden' />";
						}
    	            }},
					{data: "orgName"},
			        {data: "submitState",render:function(data,type,row){
			        	
			        	if($.trim(row.submitState) == '1'){
//					        		$("#resendButton").show();
			        		return '已报送';
			        	}else{
//					        		$("#resendButton").hide();
			        		return '未报送';
			        	}
			        }},
			        {data: "submitorgExamineTime",render:function(data,type,row){
			        	
			        	return "<span id='submitorgExamineTime"+row.id+"'>"+$.trim(row.submitorgExamineTime).substring(0,10)+"</span>";
			        }},
			        {data: null, render: function(data, type, row ) {
			        	if($.trim(row.submitState) == '1'){
			        		return Mustache.render($("#dt-row-operation").html(), {orgId:row.orgId,path:row.path,id:row.id,submitState:row.submitState});
			        	}else{
			        		return Mustache.render($("#dt-row-operation_hidden").html(), {orgId:row.orgId,path:row.path,submitState:row.submitState});
			        	}
	                }}
				],
			});
        },
        initTemplateTable:function(e){
			var id=$("#reportTemplateId").val();
			var workflow_id=$("#workflowId").val();
			$.ajax({
				type : "POST",
				url : $$ctx + "/dataSummarize/templateInit",
				data : {
					templateId : id,
					workflowId : workflow_id,
					},
				success : function(result){
					$("#no").val($.trim(result.no));
					$("#name").val($.trim(result.name));
					 var cycle = $.trim(result.cycle);
					 var data;
						if(cycle==1){
			        		data="一次性填报";
			        	} else if(cycle==2){
			        		data="年报";
			        	} else if(cycle==3){
			        		data="半年报";
			        	} else if(cycle==4){
			        		data="季报";
			        	} else if(cycle==5){
			        		data="月报";
			        	} else if(cycle==6){
			        		data="旬报";
			        	} else if(cycle==7){
			        		data="周报";
			        	} else {
			        		data="无";
			        	}
					$("#cycle").val(data);
					$("#sub_time").val($.trim(result.releasePeople));
					var type=$.trim(result.sumType);
					var sumType;
					if(type==1){
						sumType="按行汇总";
					} else if(type==2){
						sumType="按页汇总";
					}else{
						sumType="无";
					}
					$("#sum_type").val(sumType);
					$("#org").val($.trim(result.checkRole));
					
					var sta=$.trim(result.state);
					var status;
					if(sta=='0'){
						status="未汇总";
						//$("#submitAudit").hide();
					} else if(sta=='1'){
						status="已汇总";
						//$("#submitAudit").show();
					}
					$("#status").val(status);
					$("#templatePath").val($.trim(result.path));
				}
				});
			//this.initReleaseButton();
			},
			selectAll: function() {//全选
				$("#cusmanager_ck_all").click(function(){
					if(this.checked){
						$("input[name='cusmanager_ck_id']").each(function(){this.checked=true;});
					}else{
						$("input[name='cusmanager_ck_id']").each(function(){this.checked=false;});
					}
				});
			},
			initReleaseButton: function() {//发布按钮初始化
				var statu = $("#status").val();
				alert(statu+"11");
				if(statu=="已汇总"){
					$("#submitAudit").css("display","block");
					alert("已汇总");
				}else if(statu=="未汇总"){
					$("#submitAudit").css("display","none");
					alert("未汇总");
				}
				
			},
			concel: function() {
//				var viewSelf = this;
//			    var $btn = $(e.currentTarget); 
//			    var submitstate = $btn.data('submitstate');
//			    $("#tbl_cusmanager button[role=resend]").attr("disabled", false);
				
			},
			closedetail: function() {
				$("#tbl_cusmanager button[role=resend]").attr("disabled", false);
			},
			
			clickFunction: function() {
				var viewSelf = this;
				//已提交的Excel查看
				$(document).on("click", "button[role='download']", function(e) {
					var btnSelf=$(this);
					viewSelf.model.downloadReport(btnSelf.data("file-path"));
				});
				//模板Excel查看
				$("#actionButtonNext").on("click", "button[role='query']", function(e) {
					var btnSelf=$(this);
					viewSelf.model.downloadReport($("#templatePath").val());
				});
			},
			//汇总结果
			summarizeResult: function() {
				$.ajax({
					type : "POST",
					url : $$ctx + "/dataSummarize/getTemplateSumByWorkflowId",
					data : {
						workflowId: $("#workflowId").val()
					},
					success : function(result) {
						if(result.data) {
							var fileName = result.data.path;
							$.get($$ctx+"/submitDetailQuery/fileIsExists?fileName="+fileName,function(message){
								if (message == "") {
									window.location.href = $$ctx+"/submitDetailQuery/download?fileName="+fileName;
								}else {
									bootbox.alert({
										buttons:{
											ok:{
												label:"确定"
											}
										},
										message:message
									});
								}
							});
						}
					}
				});
			},
			summarizeReport: function() {
				if($("input[name='cusmanager_ck_id']:checkbox:checked").length>0){
					var templateId = $("#reportTemplateId").val();
//					if ($('#cusmanager_ck_id').get(0).checked) {
					var checkedId = "";//勾选项
					$('input[name="cusmanager_ck_id"]:checked').each(
						function() {
							checkedId = checkedId + "'"+ $(this).val() + "',";
						});
				$.ajax({
					type : "POST",
					url : $$ctx + "/dataSummarize/summarizeReport",
					data : {
						checkedId : checkedId,
						workflowId: $("#workflowId").val(),
						templateId:templateId
					},
					success : function(result) {
						if (result == "OK"){
							 bootbox.alert("汇总成功!", function() {
								 //window.parent.denyAudit();
								 //$("#proxyIFrame").attr("src", constants.portalLoginUrl + "/iframe?" + new Date().getTime());
								 //$("#summarize").attr("style","display:none!important");
								 window.opener.winOperate();
								 history.go(0);
								 $("#cusmanager_ck_all").attr('checked',false);
							 });
						}else {
							bootbox.alert(result);
						}
					}
				});
			} else {
				alert("请选择一条记录！");
			}
		},
		
		//--- 流程相关 ---//
		initButton: function(){
			var viewSelf = this;
			$('input,select,textarea',$('form[name="ruleForm"]')).attr('disabled',true);
			//初始化审核按钮
			var nodeId = $("#nodeId").val();
			viewSelf.model.getTaskActions(nodeId, function(r){
				if (r.success) {
					var publish = "";
					var html = "";
					for ( var i in r.data) {
						if(r.data[i].actionCode == '1') {
							html += "<button type='button' class='btn btn-sm btn-success' data-loading-text='正在提交..' " +
									"data-ac='" + r.data[i].actionCode + "' " +
									"data-anc='" + r.data[i].actionNameCn + "' " +
									"data-ane='" + r.data[i].actionNameEn + "' " +
									"data-io='" + r.data[i].isOpen + "' " +
									"id='submitAudit' >" +
							"<i class='ace-icon fa fa-check-square-o'></i>" + r.data[i].actionNameCn + "</button> &nbsp;&nbsp;";
						} else if(r.data[i].actionCode == '2') {
							html += "<button type='button' class='btn btn-sm btn-danger btn-next' data-loading-text='正在退回..' " +
								"data-ac='" + r.data[i].actionCode + "' " +
								"data-anc='" + r.data[i].actionNameCn + "' " +
								"data-ane='" + r.data[i].actionNameEn + "' " +
								"data-io='" + r.data[i].isOpen + "' " +
								"id='denyAudit' >" +
							"<i class='ace-icon fa fa-floppy-o'></i>" + "发起" + "</button>";
						}  else if(r.data[i].actionCode == '8') {
							publish = "<button type='button' class='btn btn-sm btn-danger btn-next' data-loading-text='正在发布..' " +
								"data-ac='" + r.data[i].actionCode + "' " +
								"data-anc='" + r.data[i].actionNameCn + "' " +
								"data-ane='" + r.data[i].actionNameEn + "' " +
								"data-io='" + r.data[i].isOpen + "' " +
								"id='submitAudit' >" +
							"<i class='ace-icon fa fa-floppy-o'></i>" + "发布" + "</button>";
						} 
					}
					$(publish).appendTo($("#actionButtonNext"));
				}
			});
		},
        initTimeLine : function () {
            var nodeId = $("#nodeId").val();
            var pointerHtml = "<i class='ace-icon fa fa-hand-o-left grey bigger-125'></i>";
            var highLight = function (selector){
                $(selector).addClass("purple").removeClass("green").parent().append($(pointerHtml));
            };
            highLight("span[nodeId='" + nodeId + "']");
        },
		initCommentList: function(curOrgId) {
			console.log(curOrgId);
        	var viewSelf = this;
    		$("#wfDetailWarp").html("");
    		$("#nextTaskAssignee").html("无");
			var workflowId = $("#workflowId").val();
			viewSelf.model.fetchCommentDetail({workflowId:workflowId,orgId:curOrgId},function(result){
				if(result.success){
					viewSelf.model.fetchResendComments({workflowId:workflowId,orgId:curOrgId},function(resultComments){
						var obj=resultComments;
						var strToobj=$.parseJSON(obj);
						for ( var index in result.data) {
							wfDetail = result.data[index];
							if(wfDetail.actionCode==null && wfDetail.orgId==curOrgId){//下一流程处理人
								$("#nextTaskAssignee").html(wfDetail.taskAssigneeCn);
							}
							if(wfDetail.orgId == curOrgId){//当前机构
								var htmlContent = "";
								var isDone = wfDetail.taskStatus=='82';
								var _taskStatus = "";
								if (wfDetail.taskStatus == "80") {
									_taskStatus = "待处理";
								} else if (wfDetail.taskStatus == "81") {
									_taskStatus = "进行中";
								} else if (wfDetail.taskStatus == "82") {
									_taskStatus = "已完成";
								} 
								var _stageNameCn = wfDetail.stageNameCn;
								var _actionNameCn = wfDetail.actionNameCn;
								if(!isDone){
									for(var i=0;i<strToobj.length;i++){
										if(wfDetail.taskId==strToobj[i].taskId){
											var time = new Date(parseInt(strToobj[i].resendTime.time));	
										    var year = time.getFullYear();
							                var month =(time.getMonth() + 1).toString();
							                var day = (time.getDate()).toString();
										    var hour = (time.getHours()).toString();
										    var min = (time.getMinutes()).toString();
										    var sec = (time.getSeconds()).toString();
										    var resendTimes = year+'-'+month+'-'+day+' '+hour+':'+min+':'+sec;
										    wfDetail.comments=strToobj[i].comments;
										    htmlContent += '<div class="timeline-item clearfix">';
											htmlContent += '	<div class="timeline-info">';
											htmlContent += '		<i class="timeline-indicator ace-icon fa fa-hand-o-right btn btn-warning no-hover"></i>';
											htmlContent += '	</div>';
											
											htmlContent += '	<div class="widget-box widget-color-orange">';
											htmlContent += '		<div class="widget-header widget-header-small">';
											
											htmlContent += '			<h5 class="widget-title smaller">';
											htmlContent += '				<span class="">'+ strToobj[i].resendPeople + '---'+ '报表收集' + '(' + '已退回' + ')' + '  操作:' + '重发' + '</span>';
											htmlContent += '			</h5>';
					
											htmlContent += '			<span class="widget-toolbar no-border">';
											htmlContent += '				<i class="ace-icon fa fa-clock-o bigger-110"></i>';
											htmlContent += wfDetail.createTime;
											htmlContent += '			</span>';
					
											htmlContent += '		</div>';
											
					
											htmlContent += '		<div class="widget-body">';
											htmlContent += '			<div class="widget-main">';
											htmlContent += '审批意见:' + (strToobj[i].comments||'无审批意见');				
											htmlContent += '			</div>';
											htmlContent += '		</div>';
											htmlContent += '		</div>';
										}
										
									}
								}else{
								
								htmlContent += '<div class="timeline-item clearfix">';
								htmlContent += '	<div class="timeline-info">';
								if(isDone) {
									htmlContent += '		<i class="timeline-indicator ace-icon fa fa-check-square-o btn btn-info no-hover"></i>';
								}else {
									htmlContent += '		<i class="timeline-indicator ace-icon fa fa-hand-o-right btn btn-warning no-hover"></i>';
								}
								htmlContent += '	</div>';
		
								htmlContent += '	<div class="widget-box '+(isDone?'transparent':'widget-color-orange')+'">';
								htmlContent += '		<div class="widget-header widget-header-small">';
								
								htmlContent += '			<h5 class="widget-title smaller">';
								htmlContent += '				<span class="">'+ wfDetail.taskAssigneeCn + '---'+ _stageNameCn + '(' + _taskStatus + ')' + '  操作:' + _actionNameCn + '</span>';
								htmlContent += '			</h5>';
		
								htmlContent += '			<span class="widget-toolbar no-border">';
								htmlContent += '				<i class="ace-icon fa fa-clock-o bigger-110"></i>';
								if (wfDetail.endTime) {
									htmlContent += wfDetail.endTime ;
								}
								htmlContent += '			</span>';
		
								htmlContent += '		</div>';
								
		
								htmlContent += '		<div class="widget-body">';
								htmlContent += '			<div class="widget-main">';
								htmlContent += '审批意见:' + (wfDetail.comments||'无审批意见');				
								htmlContent += '			</div>';
								htmlContent += '		</div>';
								htmlContent += '	</div>';
								htmlContent += '</div>';
	                               for(var i=0;i<strToobj.length;i++){
									if(wfDetail.taskId==strToobj[i].taskId){
										var time = new Date(parseInt(strToobj[i].resendTime.time));	
									    var year = time.getFullYear();
						                var month =(time.getMonth() + 1).toString();
						                var day = (time.getDate()).toString();
									    var hour = (time.getHours()).toString();
									    var min = (time.getMinutes()).toString();
									    var sec = (time.getSeconds()).toString();
									    var resendTimes = year+'-'+month+'-'+day+' '+hour+':'+min+':'+sec;
									    wfDetail.comments=strToobj[i].comments;
									    htmlContent += '<div class="timeline-item clearfix">';
										htmlContent += '	<div class="timeline-info">';
										htmlContent += '		<i class="timeline-indicator ace-icon fa fa-hand-o-right btn btn-warning no-hover"></i>';
										htmlContent += '	</div>';
										
										htmlContent += '	<div class="widget-box widget-color-orange">';
										htmlContent += '		<div class="widget-header widget-header-small">';
										
										htmlContent += '			<h5 class="widget-title smaller">';
										htmlContent += '				<span class="">'+ strToobj[i].resendPeople + '---'+ '报表收集' + '(' + '已退回' + ')' + '  操作:' + '重发' + '</span>';
										htmlContent += '			</h5>';
				
										htmlContent += '			<span class="widget-toolbar no-border">';
										htmlContent += '				<i class="ace-icon fa fa-clock-o bigger-110"></i>';
										htmlContent += wfDetail.createTime;
										htmlContent += '			</span>';
				
										htmlContent += '		</div>';
										
				
										htmlContent += '		<div class="widget-body">';
										htmlContent += '			<div class="widget-main">';
										htmlContent += '审批意见:' + (strToobj[i].comments||'无审批意见');				
										htmlContent += '			</div>';
										htmlContent += '		</div>';
										htmlContent += '		</div>';
									}
									
								}
	                               
								}
								$(htmlContent).appendTo($("#wfDetailWarp"));
								
							}
						}
					if(result.data.length <= 0) {
						$("暂无审批意见记录").appendTo($("#wfDetailWarp"));
					}
				});
				}else{
					bootbox.alert("查看详细失败请稍后重试");
				}
				
				
				
			});
        },
        audit: function() {
        	var viewSelf = this;
        	$(document).on("click", "#submitAudit", function(e) {
        		if($("#status").val()=='未汇总'){
        			alert("请在汇总后发布！");
        		}else if($("#status").val()=='已汇总'){
        		var self = $(this);
        		$("#actionCode").val(self.data("ac"));
            	var parameterJosn = {
            			workflowCode: $("#workflowCode").val(),
						workflowId: $("#workflowId").val(),
						nodeId: $("#nodeId").val(),
						wfTaskId: $("#wfTaskId").val(),
						actionCode: $("#actionCode").val(),
	                    comments: ""
            	};
            	viewSelf.model.auditNext(parameterJosn, function(result) {
                    if (result.success) {
                    	//待办统计数字
                    	utils.todoListToltalNum();
                        bootbox.alert("提交成功!", function() {
                            //window.parent.denyAudit();
                        	window.opener.winOperate();
        					window.close();
                            /*$("#proxyIFrame").attr("src", constants.portalLoginUrl + "/iframe?" + new Date().getTime());
                        	$("#proxyIFrame").on("load",function(){
            					window.close();
            			    });*/
                        });
                    } else {
                        bootbox.alert("提交失败,请稍后重试");
                    }
                });
        		}
			});
        	$(document).on("click", "#btn-download", function(e) {
        		var path = $("#path").val();
        		if(path != null && path != "") {
        			viewSelf.model.downloadReport(path);
        		}
			});
        	
        	/*$(document).on("click", "button[role=detail]", function(e) {
        		var self = $(this);
            	var orgId = self.data("orgid");
            	console.log(self);
            	console.log(orgId);
			});*/
/*        	$(document).on("click", "#tbl_cusmanager button[role=resend]", function(e) {
        		$("#tbl_cusmanager button[role=resend]").attr("disabled", true);
        		var self = $(this);
            	var orgId = self.data("orgid");
            	alert(orgId);
            	var submitTimeElement = "subTime"+self.data("id");
            	var submitTime = $("#"+submitTimeElement).html();//2015-07-28
            	$("#lookTemplate").modal("show");
            	$("#resendCommentsSubmit").attr("disabled", false);
            	$(document).on("click", "#resendCommentsSubmit", function(e) {
            	$("#resendCommentsSubmit").attr("disabled", true);
            	if($("#resendComments").val()!=''){
            	var parameterJosn = {
            			workflowCode: $("#workflowCode").val(),
    					workflowId: $("#workflowId").val(),
    					nodeId: $("#nodeId").val(),
    					wfTaskId: $("#wfTaskId").val(),
    					actionCode: "1",
    					comments: $("#resendComments").val(),
                        orgId: orgId,
                        templateId: $("#no").val(),
                        submitTime: submitTime,
            	};
            	viewSelf.model.resend(parameterJosn, function(result) {
                    if (result.success) {
                        bootbox.alert("提交成功!", function() {
                            //window.parent.denyAudit();
                        	window.opener.winOperate();
        					window.close();
                            //$("#proxyIFrame").attr("src", constants.portalLoginUrl + "/iframe?" + new Date().getTime());
                        });
                    } else {
                        bootbox.alert("提交失败,请稍后重试");
                    }
                });
        }else{
        	 bootbox.alert("请输入退回意见");
        	 $("#tbl_cusmanager button[role=resend]").attr("disabled", false);
        }
        	});
        	});*/
        }
	});
	module.exports = view;
})