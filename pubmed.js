var $j = jQuery.noConflict();

PubMed.NCBI = "http://www.ncbi.nlm.nih.gov";
PubMed.Abstract = "abstract";
PubMed.Summary = "docsum";
PubMed.SUMMARY_TITLE_NODE_SELECTOR = "p.title[pmid]"; 
PubMed.ABSTRACT_TITLE_NODE_SELECTOR = "h1[pmid]"; 
PubMed.ABSTRACT_ABSTRACT_NODE_SELECTOR = "span[abstract][pmid]"; 

function PubMed(){
	var __SUMMARY_PMID_NODE__ = "div.aux > div.resc > dl.rprtid > dd:first",
			__SUMMARY_PREFIX_NODE_PATH__ = "div.rslt > ",
	    __SUMMARY_TITLE_NODE__ = "p.title", 
	    __SUMMARY_NODE__ = "form#EntrezForm > div > div#maincontent > div.content > div > div.rprt", 
	    __SUMMARY_JOURNAL_NODE__ = "div.supp > p.details > span.jrnl",
	    __ABSTRACT_PREFIX_NODE_PATH__ = "div.rslt > ", 
	    __ABSTRACT_TITLE_NODE__ = "h1",
	    __ABSTRACT_NODE__ = "form#EntrezForm > div > div#maincontent > div.content > div.rprt_all > div.rprt.abstract", 
	    __ABSTRACT_SECTION_NODE__ = "> h4", 
	    __ABSTRACT_ABSTRACT_NODE__ = "div.abstr > div", 
	    __ABSTRACT_PARAGRAPH_NODE__ = "> p > abstracttext", 
	    __ABSTRACT_PMID_NODE__ = "div.aux > div.resc > dl.rprtid > dd:first",
	    __ABSTRACT_JOURNAL_NODE__ = "div.cit > span > a"
	    __PMID_ATTRIBUTE__ = "pmid";
	this.__updateAbstract__ = function(node, pmid){
		var wrap_selector = $j(__ABSTRACT_ABSTRACT_NODE__ + __ABSTRACT_SECTION_NODE__, node);
		if(wrap_selector.length > 0){ // have section
			wrap_selector = wrap_selector.add(wrap_selector.next());
		}else{
			wrap_selector = $j(__ABSTRACT_ABSTRACT_NODE__ + __ABSTRACT_PARAGRAPH_NODE__, node);
		}
		
		wrap_selector.wrapAll($j("<span/>", {abstract: true,
                                         pmid: pmid}));
	};
	this.__updateTitle__ = function(title_node, pmid, title){
		title_node.attr(__PMID_ATTRIBUTE__, pmid)
			         .html(title+"&nbsp;");
	}
	// Add a document icon and a hyperlink for each article
	this.preprocess = function(icon_path){
		// Get all title information
		var o_titles = $j(__SUMMARY_PREFIX_NODE_PATH__ + __SUMMARY_TITLE_NODE__, __SUMMARY_NODE__),
			  pmid_node_selectors =$j( __SUMMARY_PREFIX_NODE_PATH__ + __SUMMARY_PMID_NODE__, __SUMMARY_NODE__), 
			  i, title_node, title, link, image, pmid;
		if(o_titles.length < 1){
			o_titles = $j(__SUMMARY_TITLE_NODE__, __SUMMARY_NODE__);
			pmid_node_selectors =$j(__SUMMARY_PMID_NODE__, __SUMMARY_NODE__)
		}
			
		// Display Settings: Format=Abstract
		// More than 1 article
		if(o_titles.length < 1){
			o_titles = $j(__ABSTRACT_PREFIX_NODE_PATH__ + __ABSTRACT_TITLE_NODE__, __ABSTRACT_NODE__);
		}
		for(i = 0; i < o_titles.length; i++){
			title_node = $j(o_titles[i]);
			pmid = $j(pmid_node_selectors[i]).text();
			title = title_node.text();
			link = PubMed.NCBI +$j("a", title_node).attr("href");
			this.__updateTitle__(title_node, pmid, title);
			if(icon_path){
				image = $j("<img/>", {border: '0',
					                    src: icon_path,
					                    alt: 'View'});
				title_node.append($j("<a />", {title: "View",
					                            href: link}).append(image));
			}
			$j("div.supp > p.desc", title_node.parent()).wrap("<a href='"+link+"'></a>").css({'text-decoration':'underline'});			
			// wrap abstract with our tag: pubmedex_abstract
			this.__updateAbstract__(title_node.parent(), pmid);
		}
		//////////////////////////////////////////////////////////////////
		// Display Settings: Format=Abstract
		// Only 1 article.
		if(o_titles.length < 1){
			o_titles = $j(__ABSTRACT_TITLE_NODE__, __ABSTRACT_NODE__);
			title_node = $j(o_titles[0]);
			pmid = $j(pmid_node_selectors[i]).text();
			title = title_node.text();
			this.__updateTitle__(title_node, pmid, title);
			
			// wrap abstract with our tag: pubmedex_abstract
			this.__updateAbstract__(title_node.parent(), pmid);		
		}
		return o_titles.length;
	};
	// Retrieve PubMed Display Setting in Summary Format
	this.getSummaries = function(l){
		// Special case for only one summary
		var summaries = $j(__SUMMARY_NODE__),
		    journal_node_selector = __SUMMARY_JOURNAL_NODE__,
			  title_node_selector = __SUMMARY_TITLE_NODE__,
			  pmid_node_selector = __SUMMARY_PMID_NODE__,
			  summary_list = new Array(),
			  i, summary_node, pmid, title, journal_node, article;
		// More than 1 summary => add prefix
		if(l > 1){
			title_node_selector = __SUMMARY_PREFIX_NODE_PATH__ + __SUMMARY_TITLE_NODE__,
			journal_node_selector = __SUMMARY_PREFIX_NODE_PATH__ + __SUMMARY_JOURNAL_NODE__,
			pmid_node_selector = __SUMMARY_PREFIX_NODE_PATH__ + __SUMMARY_PMID_NODE__;
		}
		for(i = 0; i < summaries.length; i++){			
			summary_node = $j(summaries[i]);
			pmid = $j(pmid_node_selector, summary_node).text();
			//console.log(pmid_node_selector);
			//console.log(pmid);
			title = $j(title_node_selector, summary_node).text();
			journal_node = $j(journal_node_selector, summary_node);
			article = new Article(pmid, journal_node, title);
			article.title_node = $j(title_node_selector, summary_node);
			summary_list.push(article);
		}
		return summary_list;
	}
	// Retrieve PubMed Display Setting in Abstract Format
	this.getAbstracts = function(count){
		var abstracts = $j(__ABSTRACT_NODE__),
			  title_node_selector = __ABSTRACT_TITLE_NODE__,
			  pmid_node_selector = __ABSTRACT_PMID_NODE__,
			  abstract_node_selector = PubMed.ABSTRACT_ABSTRACT_NODE_SELECTOR,
			  journal_node_selector = __ABSTRACT_JOURNAL_NODE__,
			  paragraph_node_selector = __ABSTRACT_PARAGRAPH_NODE__,
			  section_node_selector = __ABSTRACT_SECTION_NODE__,
			  abstract_list = new Array(),
			  i, j,
			  abstracts_node, pmid, title, journal_node, sections, paragraphs, section_count, abs_pargraphs, article;
		// More than 1 article
		if(count > 1){
			title_node_selector = __ABSTRACT_PREFIX_NODE_PATH__ + title_node_selector;
			pmid_node_selector = __ABSTRACT_PREFIX_NODE_PATH__ + pmid_node_selector;
			abstract_node_selector = __ABSTRACT_PREFIX_NODE_PATH__ + abstract_node_selector;
			journal_node_selector = __ABSTRACT_PREFIX_NODE_PATH__ + journal_node_selector;
		}
		for(i = 0; i < abstracts.length; i++){
			abstracts_node = $j(abstracts[i]);
			pmid=$j(pmid_node_selector, abstracts_node).text();
			title = $j(title_node_selector, abstracts_node).text();		
			journal_node = $j(journal_node_selector, abstracts_node);
			sections = $j(abstract_node_selector+section_node_selector, abstracts_node);				
			paragraphs = $j(abstract_node_selector+paragraph_node_selector, abstracts_node);		
			section_count = sections.length==0 ? 1 : sections.length;
			abs_pargraphs = new Array();
			section_names = new Array();
			for(j=0; j<section_count; j++){
				if(sections.length > 0){
					section_names.push($j(sections[j]).text());
				}
				abs_pargraphs.push($j(paragraphs[j]).text());
			}		
			article = new Article(pmid, journal_node, title, abs_pargraphs, section_names, 
			                      $j(title_node_selector, abstracts_node), 
			                      $j(abstract_node_selector, abstracts_node));
			abstract_list.push(article);
		}
		return abstract_list;
	};
}


	
PubMed.prototype = {
	getDisplaySetting : function(){
		var report=$j("head > meta[name='ncbi_report']");
		if(report.length){
			if($j("head > meta[name='ncbi_report'][content='docsum']").length){
				return PubMed.Summary;
			}else if($j("head > meta[name='ncbi_report'][content='abstract']").length){
				return PubMed.Abstract;
			}
		}else{
			return;
		}	
	}
};

PubMed.INPUT_TERM = $j("div.search_form > div.nowrap > div.nowrap > div > input#term:first").attr("value");
PubMed.SEARCH_DETAILS = $j("div#search_details > textarea").val();
PubMed.RESULTS_NODE = $j("div > div > div > div > div > h2.result_count");
PubMed.TITLE_PAGER_NODE = $j("div > div > div > div.title_and_pager");

PubMed.prototype.getSearchDetails = function(){
	return { Search: PubMed.INPUT_TERM,
					 SearchDetail: PubMed.SEARCH_DETAILS};
}

PubMed.prototype.SEARCH_TERMS = [];

PubMed.prototype.queryProcess = function(term){
	var ats = term.split(new RegExp("\\s*AND\\s*")),
	    pattern, i, at, ots;
	for(i=0; i<ats.length; i++){
		pattern  = /^\(+|\)+$/g,
		at = ats[i].replace(pattern, ""),
		ots = at.split(new RegExp("\\s*OR\\s*"));
		if(ots.length == 1){
			pattern = new RegExp("[^\\[]+"),
			t = at.match(pattern)[0];
	    pattern = new RegExp("\"([^\"]+)\"");
	    if(pattern.test(t)){    	
	    	t = t.match(pattern)[1];
	    }
	    PubMed.prototype.SEARCH_TERMS.push(t);    
	    console.log(t);
	  }else{
		  for(j=0; j<ots.length; j++){
				pattern=new RegExp("\"([^\"]+)\""),
				ot = ots[j].match(pattern);
				if(ot){
					PubMed.prototype.SEARCH_TERMS.push(ot[1]);
					console.log(ot[1]);
				}else{
					// xxxx[constraint], (xxxx[constraint], xxxx[constraint]), ...
					pattern = new RegExp("[^\\[]+"),
					t = ots[j].match(pattern)[0];
					PubMed.prototype.SEARCH_TERMS.push(t);    
	    		console.log(t);	
				}
			}
		}
	}
	
	PubMed.prototype.SEARCH_TERMS.sort(function(a, b){
  	if(a.length == b.length) { return 0; }
    if (a.length > b.length){ return -1; }
    else{ return -1; }
	});
}
{
	if(PubMed.prototype.SEARCH_DETAILS){
		PubMed.prototype.queryProcess(PubMed.prototype.SEARCH_DETAILS);
	}
}














PubMed.prototype.EntrezGene = PubMed.prototype.NCBI + "/sites/entrez?db=gene&term=";
PubMed.prototype.DisplaySummary = "Summary";
PubMed.prototype.DisplayAbstract = "Abstract";

function Article(pmid, journal_node, title, abs, sec, title_node, abstract_node){
	this.pmid = pmid;
	this.title = title;
	this.abs = abs;
	this.sections = sec;
	this.title_node = title_node;
	this.abstract_node = abstract_node;
	this.journal_node = journal_node;
}





