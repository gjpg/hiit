import { component$, $ } from "@builder.io/qwik";

export default component$(() => {
    return(
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">



    <circle
            cx="50%" cy="50%" r="90"
            stroke="green"
            stroke-width="20"
            fill="none" />


    <circle
            cx="50%" cy="50%" r="90"
            stroke="red"
            stroke-width="20"
            fill="none"
            stroke-dasharray="5% 10%"
            />


    <circle
            cx="50%" cy="50%" r="90"
            stroke="blue"
            stroke-width="20"
            fill="none"
            stroke-dashoffset="100"
            stroke-dasharray="282 282"
    />

</svg>

    )

});

//parameters need to be numbers otherwise can't be used in calculations
//can turn them back into strings later


interface CircleParameters {

    width: number;
    height: number;
    radius: number;
    strokeWidth: number;

    colourRest: string;
    //green

    colourRun: string;
    //red
    arrayRun: number;
    //inputs needed: warmup length, rest length, run length, run count
    //from that, calculate total length
    //lengthTotal = ((2 * warmup) + (count * (rest + run)) - rest)
    //to account for the space taken up by the bottom segment:
    //(1 - portionSegment) * 2 * π * radius
    //to make it look clean:
    //share = 2 * π * radius / lengthTotal
    //should look like this:
    //stroke-dasharray="(1 - portionSegment) * share)) (warmup * share) (run * share) (rest * share) (run * share) (warmup * share)"

    colourSegment: string;
    //blue
    portionSegment: number;
    //to determine the portion that the bottom segment fills
    //eg. 0.4
    //cannot be greater or equal to 1
    //cannot be less than or equal to 0
    arraySegment: dunno;
    //composed of 2 parts
    //portionSegment * 2 * π * radius
    //(1 - portionSegment) * 2 * π * radius
    
    offset: number;
    //to align bottom segment (for both Run and Segment)
    //portionSegment * π * radius

};

//<svg xmlns="http://www.w3.org/2000/svg" width="width" height="height">


//<circle class="circleRest">
//cx="50%" cy="50%" 
//fill="none"
//
//r="radius"
//stroke-width="strokeWidth"
//
//stroke=colourRest
///>


//<circle class="circleRun">
//cx="50%" cy="50%" 
//fill="none"
//
//r="radius"
//stroke-width="strokeWidth"
//
//stroke=colourRun
//
//stroke-dasharray="arrayRun"
//
////stroke-dashoffset="offset"
///>


//<circle class="circleSegment">
//cx="50%" cy="50%" 
//fill="none"
//
//r="radius"
//stroke-width="strokeWidth"
//
//stroke=colourSegment
//
//stroke-dasharray="arraySegment"
//
//stroke-dashoffset="offset"
///>


//</svg>