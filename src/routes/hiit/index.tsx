import { component$, $ } from "@builder.io/qwik";

interface CircleProps {
    labelSegment: number; // 0 -> 1
}

//positive offset = anti-clockwise
//negative offset = clockwise

//we want labelSegment offsetted to be centered at 6 o clock
//calculate how many pixels to offset to do that
//-0.25 * pathLength moves it to START at 6 o clock
//then take HALF of labelSegment and calculate what proportion of pathLength that is
//(labelSegment/2) * pathLength)

//so:
//((-0.25 * pathLength) + ((labelSegment/2) * pathLength))

export default component$(({labelSegment = 0.3}: CircleProps) => {
    const radius = 90;
    const pathLength = radius * 2 * Math.PI;
    const offset = ((-0.25 * pathLength) + ((labelSegment / 2) * pathLength));

    //user defined run parameters (time in seconds):
    const warmup = 300;
    const sprint = 40;
    const rest = 60;
    const sprintCount = 5;

    //tally up
    const runLength = ((sprintCount * (rest + sprint))) + (2 * warmup) - rest;

    //what to multiply everything by so that it's offset properly on the circle
    const lengthMultiplier = (runLength / pathLength);


    console.log("pathLength", pathLength);
    console.log("offset", offset);
    console.log("runLength", runLength);
    console.log("lengthMultiplier", lengthMultiplier);

    return(
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">



    <circle
            cx="50%" cy="50%" r={radius}
            stroke="green"
            stroke-width="20"
            fill="none" />


    <circle
            cx="50%" cy="50%" r={radius}
            stroke="red"
            stroke-width="20"
            fill="none"
            stroke-dasharray={[(-1 * offset), warmup, sprint, rest, sprint, rest, sprint, rest, sprint, rest, sprint, warmup].map((x, index) => index===0? x : (x / lengthMultiplier))}
            stroke-dashoffset={[1.5 * offset]}
            />


    <circle
            cx="50%" cy="50%" r={radius}
            stroke="blue"
            stroke-width="20"
            fill="none"
            stroke-dashoffset={[offset]}
            stroke-dasharray={[labelSegment, 1 - labelSegment].map(l => l * pathLength)}
    />

</svg>

    )

});

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