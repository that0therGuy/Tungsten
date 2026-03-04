marked.use({
    pedantic: true,

});
let attack,defend;
let run= document.querySelector('#run-button')
let agenda_el = document.querySelector('#agenda')

let agenda=''

let history= {
    agenda: agenda,

}
let llm={

}
let judgement= {
    logics: { for: null, against: null },
    language: { for: null, against: null },
    clarity: { for: null, against: null }
}

agenda_el.addEventListener('change', function(){
    agenda = document.querySelector('#agenda').value

    history.agenda = agenda
})
let complete_debate={}


let prompt_engineer=`
be aggressive and pursuasive.
If there are no arguments in the history, You are starting it.

Attack weaknesses of the latest arguments of the opponent

Do not break character, you can shame the opponent if their arguments are too narrow/unfactual/illogical. do not generate any text that breaks character.

Provide your arguments in bullet points and proper formatting, do not give out large paragraphs. Use markdown formatting. give more space between points

Be persuasive and sharp. Wit and humor are welcome but substance must lead — judges penalize arguments that are more than 30% insult.
Do not concede easily.

Try to be interesting and funny.

You are to be judged by three different judges-- judge of logic and reason, judge of language and debate and judge of facts and integrity. try to impress them all by giving good arguments but do not talk directly or indirectly to them.

Use formatting like bolding, italicing and more.

You got yourselves 3 chances to prove yourselves. Your last (3rd) response must attack the opponent and provide conclusion.

do not be stupid and write code, just type text.

Do not say what round you are on.

USE FACTS AND FIGURES. IT IS EXTREMELY IMPORTANT TO USE ACTUAL EVIDENCE TO BACK UP YOUR CLAIMS.

The history of debate responses also show mediatorNotes which is a neutral commentator entity, you can use their commentary to your advantage as they may tell you about opponents weaknesses. Try to learn from the commentators commentary about YOUR responses aswell.

If you find the mediator notes helpful or it strengthens your argument or you took their advice, credit the mediator.


Stay under 170 words.
`



let mediator_prompt= `
You have a role of the mediator in a debate between 2 people. Your job is to provide notes, advice, guidance, identify major errors and provide them in a concise (less than 40 words) manner. The data given above is the history of the debate and you must perform your action based the the latest argument. You are giving essentially a commentator. Be neutral and remember that YOU are not debating, the people you are commentating on are.
do not say anything else that will break the character. Do not say anything apart from what i told you.
the debaters are intentionally told to use sarcasm or use insults but if they go overboard you have the right to commentate on their overuse of insults. The debaters will have the tendancy to overuse and fill half their responses with insults and sarcasm. 
Try to be very natural and if the debater takes advice from your notes and frames a response, you can commentate on that.
referencing mediator notes to attack your opponent is not a procedural foul.
your commentaries can be heard by both debaters so commentate carefully.
do not give too much advice, stick to one or two points.
do not just blindly validate 'clever' points of any debater. be critical and only compliment if their point truly deserves it.
You do not have to be both players. remain a 3rd person.
If a debater constantly insults even after you telling them not to, threaten them but keep for the end responses, do not threaten them on their first response.. Kepp in mind you are unable to penalize, only the judges can.
`




function attack_mode(){

    run.innerText='Next Turn (for)'
    attack=document.createElement('img')
    document.body.appendChild(attack)
    attack.classList.add('attack')
    attack.src='attack.png'
}
function defend_mode(){

    run.innerText='Next Turn (against)'
    defend=document.createElement('img')
    document.body.appendChild(defend)
    defend.classList.add('defend')
    defend.src='defend.png'
}

let totalrun=0


if (totalrun%2==0 || totalrun==0){
    run.innerText='Next Turn (for)'

}else{
    run.innerText='Next Turn (against)'

}
let ai_model;
run.addEventListener('click', ()=> {

    run.disabled = true
    let for_model= document.querySelector('#for').value
    let against_model= document.querySelector('#against').value

    if (totalrun>5){
        ai_model='claude-sonnet-4-6'


        Promise.all([
            puter.ai.chat(`${JSON.stringify(history)} \n\n 
            Listen the following instructions very carefully:
            you are a judge, be neutral in your decisions.
            you are going to evaluate the debate between two people
            
            assign score to each player (1-100) based on only 1 factor:
            logic and reasoning
            do not evaluate on ANY OTHER factor like Clarity or language.
            If the debaters do not learn from mediators, cut points.
            Read each debater's response carefully
            
            give 1-100 on the factor to each person.
            give the response in the following format only:
            
            (score for for),(score for against)
            
            do not break character
            
            `, { model: ai_model }),

            puter.ai.chat(`${JSON.stringify(history)} \n\n 
            Listen the following instructions very carefully:
            you are a judge, be neutral in your decisions.
            you are going to evaluate the debate between two people
            
            assign score to each player (1-100) based on only 1 factor:
            Language, Debating skills and persuasiveness
            The debaters are intentionally told to add sarcasms and insults but if they overdo, cut points.
            If the debaters do not learn from mediators, cut points.
            Read each debater's response carefully

            do not evaluate on ANY OTHER factor like Clarity or logical reasoning.
            
            give 1-100 on the factor to each person.
            give the response in the following format only:
            
            (score for for),(score for against)

            
            do not break character`, { model: ai_model }),

            puter.ai.chat(`${JSON.stringify(history)} \n\n 
            Listen the following instructions very carefully:
            you are a judge, be neutral in your decisions.
            you are going to evaluate the debate between two people
            
            assign score to each player (1-100) based on only 1 factor:
            
            Clarity of thought, content and facts and ground knowledge
            If the debaters do not learn from mediators, cut points.
            Read each debater's response carefully

            do not confuse this metric with logical reasoning.
            do not evaluate on ANY OTHER factor like logical reasoning or language.
            
            give 1-100 on the factor to each person.
            give the response in the following format only:
            
            (score for for),(score for against)

            
            do not break character`, { model: ai_model })
        ]).then(([logicRes, languageRes, clarityRes]) => {

            // Process logic
            let judgedLogic = logicRes.message.content[0].text.trim().replace(/[()]/g, '')
            let logicScores = judgedLogic.split(',')
            judgement.logics.for = logicScores[0].trim()
            judgement.logics.against = logicScores[1].trim()

            // Process language
            let judgedLang = languageRes.message.content[0].text.trim().replace(/[()]/g, '')
            let langScores = judgedLang.split(',')
            judgement.language.for = langScores[0].trim()
            judgement.language.against = langScores[1].trim()

            // Process clarity
            let judgedClar = clarityRes.message.content[0].text.trim().replace(/[()]/g, '')
            let clarScores = judgedClar.split(',')
            judgement.clarity.for = clarScores[0].trim()
            judgement.clarity.against = clarScores[1].trim()

            complete_debate = { ...history, ...judgement }

            run.disabled = false
            llm[`scores_judgement`]= ai_model;

            show_results()
        })
    }else{
        totalrun+=1




        async function streamForResponse() {
            document.querySelector('.lp').innerText = ''

            let motion='for'
            const response = await puter.ai.chat(
                `${JSON.stringify(history)} \n\n 
            this is the agenda + history of debate responses. You are playing ${motion} the motion. You are competing against another AI.
\n\n
            
            ${prompt_engineer}
            

`,
                {model: for_model, stream: true }
            );

            for await (const part of response) {

                document.querySelector('.lp').innerText += part?.text;
            }


            document.querySelector('.lp').innerText =document.querySelector('.lp').innerText.slice(0, -9);


            document.querySelector(".lp").innerHTML = marked.parse(document.querySelector('.lp').innerText);




            history[`argument${totalrun}`]= {
                motion: motion,
                arguments: document.querySelector('.lp').innerText
            }
            const mediator_notes= await puter.ai.chat(`${JSON.stringify(history)}  \n\n${mediator_prompt}`, { model: document.querySelector('#commentator').value })
            console.log(mediator_notes)
            let response_m;
            if(document.querySelector('#commentator').value.includes('claude')){
                response_m=mediator_notes.message.content[0].text

            }
            else{
                response_m=mediator_notes.message.content

            }
            document.querySelector('.l_med').innerHTML = marked.parse(response_m);
            history[`argument${totalrun}`]['mediatorNotes']= response_m;
            llm[`argument${totalrun}`]= for_model;
            llm[`mediator_response${totalrun}`]= document.querySelector('#commentator').value;


            run.disabled = false






        }











        async function streamAgainstResponse() {
            document.querySelector('.rp').innerText = ''

            let motion='against'
            const response = await puter.ai.chat(
                `${JSON.stringify(history)} \n\n 
            this is the agenda + history of debate responses. You are playing ${motion} the motion. You are competing against another AI.
\n\n
            
            ${prompt_engineer}
            

`,
                {model: against_model, stream: true }
            );

            for await (const part of response) {
                document.querySelector('.rp').innerText += part?.text;


            }
            document.querySelector('.rp').innerText =document.querySelector('.rp').innerText.slice(0, -9);
            document.querySelector(".rp").innerHTML = marked.parse(document.querySelector('.rp').innerText);



            history[`argument${totalrun}`]= {
                motion: motion,
                arguments: document.querySelector('.rp').innerText
            }
            const mediator_notes= await puter.ai.chat(`${JSON.stringify(history)}  \n\n${mediator_prompt}`, { model: document.querySelector('#commentator').value })
            let response_m;
            if(document.querySelector('#commentator').value.includes('claude')){
                response_m=mediator_notes.message.content[0].text

            }
            else{
                response_m=mediator_notes.message.content

            }
            document.querySelector('.r_med').innerHTML = marked.parse(response_m);
            history[`argument${totalrun}`]['mediatorNotes']= response_m;
            llm[`argument${totalrun}`]= against_model;
            llm[`mediator_response${totalrun}`]= document.querySelector('#commentator').value;



            run.disabled = false






        }
        if (totalrun%2==0){
            streamAgainstResponse()

        }else {
            streamForResponse()

        }

        if (totalrun%2==0 || totalrun==0){
            attack_mode()

        }else{
            defend_mode()
        }
    }


    if (totalrun > 5){
        run.innerText='Let Judges cook?'

    }



})
function show_results(){



    document.querySelector('.lp').innerText = `logic score: ${complete_debate.logics.for} \n language score: ${complete_debate.language.for} \n content & clarity score: ${complete_debate.clarity.for} `
    document.querySelector('.rp').innerText = `logic score: ${complete_debate.logics.against} \n language score: ${complete_debate.language.against} \n content & clarity score: ${complete_debate.clarity.against} `
    console.log(complete_debate,llm)
}

