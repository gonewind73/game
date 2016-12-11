/**
 * Created by mengdi on 2015/10/29.
 */

var GAME={};
GAME.matchingGame={};
GAME.matchingGame.cardWidth=80;//牌宽
GAME.matchingGame.cardHeight=120;
GAME.matchingGame.deck=
    [
        "cardAK","cardAK",
        "cardAQ","cardAQ",
        "cardAJ","cardAJ",
        "cardBK","cardBK",
        "cardBQ","cardBQ",
        "cardBJ","cardBJ"
    ]
//随机排序函数，返回-1或1
function shuffle()
{
    //Math.random能返回0~1之间的数
    return Math.random()>0.5 ? -1 : 1
}
//  翻牌功能的实现
function selectCard() {
    var $fcard=$(".card-flipped");
    //翻了两张牌后退出翻牌
    if($fcard.length>1)
    {
        return;
    }
    //alert($(this).data("pattern"));
    $(this).addClass("card-flipped");
//    若翻动了两张牌，检测一致性
    var $fcards=$(".card-flipped");
    if($fcards.length==2)
    {

        setTimeout(function(){
        checkPattern($fcards);},700);
    }
}
//检测2张牌是否一致
function checkPattern(cards)
{
    var pattern1 = $(cards[0]).data("pattern");
    var pattern2 = $(cards[1]).data("pattern");

    $(cards).removeClass("card-flipped");
    if(pattern1==pattern2)
    {

        $(cards).addClass("card-removed")
            .bind("webkitTransitionEnd",function(){
                $(this).remove();
    });
    }
}

function deal(){
	$(".card").remove();
	GAME.matchingGame.deck=
	    [
	        "cardAK","cardAK",
	        "cardAQ","cardAQ",
	        "cardAJ","cardAJ",
	        "cardBK","cardBK",
	        "cardBQ","cardBQ",
	        "cardBJ","cardBJ"
	    ]
	GAME.matchingGame.deck.sort(shuffle);
	for(var i=0;i<12;i++){
		var pattern=GAME.matchingGame.deck.pop();
		$('#cards')
		.append(
				'<div class="card"><div class="face front"></div>'
				+'<div class="face back"></div></div>')
		var c=$(".card").last()
		c.css({
				"left":((GAME.matchingGame.cardWidth+20)*(i%4)+25)+"px",
				"top":((GAME.matchingGame.cardHeight+20)*Math.floor(i/4)-10)+"px"
			});
		c.data("pattern",pattern)
		c.find(".back").addClass(pattern);
		c.click(selectCard)
		
	}
	
}

function init(){
	
	var ns = 0.85
	var os = 1
		//实现随机洗牌
		//$(".card").remove();

		$('a.Action')
		.animate({scale : ns}, 0).click(function(e) {
				deal();
				return false
			})
			.hover(function() {
			$(this).stop().animate({
				scale : 1.2
			}, 250);
			}, function() {
				$(this).stop().animate({
					scale : 1
				}, 125);
			})
		deal();

}

$(document)
.ready(
		function() {
			init()
		})