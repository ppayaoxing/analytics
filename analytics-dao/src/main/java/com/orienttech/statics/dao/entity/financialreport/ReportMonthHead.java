package com.orienttech.statics.dao.entity.financialreport;

import static com.orienttech.statics.commons.utils.Contants.TJ_SCHEMA;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "REPORT_MONTH_HEAD", schema = TJ_SCHEMA)
public class ReportMonthHead {

	@Id
	@Column(name = "REPORT_ID")
	private String reportId;//指标说明
	
	@Column(name="BUSI_MONTH",length=6)
	private String busiMonth;//年度月份旬
	
	@Column(name="RANK_NUM",length=6)
	private Integer rankNum;//排名
	
	@Column(name="ORG_ID",length=30)
	private String orgId;//机构ID
	
	@Column(name="ORG_NAME",length=200)
	private String orgName;//机构名称
	
	@Column(name="APPLY_USER_NAME",length=200)
	private String applyUserName;

	@Column(name="AMT1",length=200)
	private BigDecimal amt1;//数值1
	
	@Column(name="AMT2",length=200)
	private BigDecimal amt2;//数值2
	
	@Column(name="AMT3",length=200)
	private BigDecimal amt3;//数值3
	
	@Column(name="AMT4",length=200)
	private BigDecimal amt4;//数值4
	
	@Column(name="AMT5",length=200)
	private BigDecimal amt5;//数值5
	
	@Column(name="AMT6",length=200)
	private BigDecimal amt6;//数值6
	
	@Column(name="MEMO",length=500)
	private String memo;//备注
	
	public ReportMonthHead(){
		super();
	}

	public ReportMonthHead(String reportId, String busiMonth, Integer rankNum,
			String orgId, String orgName,String applyUserName, BigDecimal amt1, BigDecimal amt2,
			BigDecimal amt3, BigDecimal amt4, BigDecimal amt5, BigDecimal amt6,
			String memo) {
		super();
		this.reportId = reportId;
		this.busiMonth = busiMonth;
		this.rankNum = rankNum;
		this.orgId = orgId;
		this.orgName = orgName;
		this.applyUserName = applyUserName;
		this.amt1 = amt1;
		this.amt2 = amt2;
		this.amt3 = amt3;
		this.amt4 = amt4;
		this.amt5 = amt5;
		this.amt6 = amt6;
		this.memo = memo;
	}

	public String getReportId() {
		return reportId;
	}

	public void setReportId(String reportId) {
		this.reportId = reportId;
	}

	public String getBusiMonth() {
		return busiMonth;
	}

	public void setBusiMonth(String busiMonth) {
		this.busiMonth = busiMonth;
	}

	public Integer getRankNum() {
		return rankNum;
	}

	public void setRankNum(Integer rankNum) {
		this.rankNum = rankNum;
	}

	public String getOrgId() {
		return orgId;
	}

	public void setOrgId(String orgId) {
		this.orgId = orgId;
	}

	public String getOrgName() {
		return orgName;
	}

	public void setOrgName(String orgName) {
		this.orgName = orgName;
	}

	public String getApplyUserName() {
		return applyUserName;
	}

	public void setApplyUserName(String applyUserName) {
		this.applyUserName = applyUserName;
	}

	public BigDecimal getAmt1() {
		return amt1;
	}

	public void setAmt1(BigDecimal amt1) {
		this.amt1 = amt1;
	}

	public BigDecimal getAmt2() {
		return amt2;
	}

	public void setAmt2(BigDecimal amt2) {
		this.amt2 = amt2;
	}

	public BigDecimal getAmt3() {
		return amt3;
	}

	public void setAmt3(BigDecimal amt3) {
		this.amt3 = amt3;
	}

	public BigDecimal getAmt4() {
		return amt4;
	}

	public void setAmt4(BigDecimal amt4) {
		this.amt4 = amt4;
	}

	public BigDecimal getAmt5() {
		return amt5;
	}

	public void setAmt5(BigDecimal amt5) {
		this.amt5 = amt5;
	}

	public BigDecimal getAmt6() {
		return amt6;
	}

	public void setAmt6(BigDecimal amt6) {
		this.amt6 = amt6;
	}

	public String getMemo() {
		return memo;
	}

	public void setMemo(String memo) {
		this.memo = memo;
	}


	

}
