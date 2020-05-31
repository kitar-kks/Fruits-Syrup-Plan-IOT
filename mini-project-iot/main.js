let leds = [];
let press = 1;
let auto = 0;


function init (link,ui){
    const title = new Text();
    title.setText("Sugar Refining Plan");
    title.setColor("GreenYellow");
    title.setSize(50);
    title.getHeadIcon().setColor("LightSalmon");
    title.getHeadIcon().setIcon("gear");
    title.getTailIcon().setColor("LightSalmon");
    title.setDisplay('block');

    leds = createLed_Onweb(link);
    const grids1 = cereateGrids(2,3);
    const grids = cereateGrids(1,4);
    knobs = motor(link);
    Gauges = createGauges(link, ui);
    buttons= createButton (link,leds);

    grids1.addChildTo(0,0,Gauges[0]);
    grids1.addChildTo(0,1,Gauges[1]);
    grids1.addChildTo(1,0,Gauges[2]);
    grids1.addChildTo(1,1,Gauges[3]);
    grids1.addChildTo(0,2,knobs[0]);
    grids1.addChildTo(1,2,knobs[1]);
    grids.addChildTo(0,0,buttons[0]);
    grids.addChildTo(0,1,buttons[1]);
    grids.addChildTo(0,2,buttons[2]);
    grids.addChildTo(0,3,buttons[3]);


    //build (link,ui);

}

function cereateGrids(r, c) {
    const grids = new Grids({
        rows: r,
        cols: c
    });
    return grids;
}

function motor(link) {
    const classes = ['success', 'info'];
    let pwmId = 1;
    const knobs = [];
    classes.forEach(c => {
        const knob = new Knob({
            className: c,
            min:1,
            max:99,
            value:1,
            uid: pwmId,
            callback: (uid, val) => {
                let ratio = val / 100;
                link.pwmStop(2);
                link.pwmStop(3);
                link.pwmDutyRatio(uid, ratio);
            }
        });
        pwmId -= 1;
        knobs.push(knob);
    });
    return knobs;
}

function createGauges(link, ui) {

    const classes = ['danger', 'warning', 'success','info'];
    const gauges = [];
    classes.forEach(c => {
        const g = new Gauge({
            className: c,
        });
        gauges.push(g);
    });
    return gauges;

}

function UpdateGauge(ch, val) {
    val = val*100/1023;
    Gauges[3-ch].setValue(val);
}


function createLed_Onweb(link) {

    const types  = ['red', 'green', 'blue','yellow'];
    const labels = ['Valve Water', 'Valve Storage', 'Pumb','Auto/Manual'];
    let uid  = 0;
    const leds = [];
    types.forEach(type => {
        let led = new Led( {
            type:  type,
            uid:   3-uid,
            label: labels[uid],
        });
        led.setTextColor('#08f');
        led.setStatus(false);
        uid++;
        leds.push(led);
    });
    return leds;
}

function updateSwitchStatus(ch, sts,link) {
    let id = 3-ch;
    leds[id].setStatus(sts);
    link.ledWrt(id,sts);
    //console.log(id);
}

function createButton (link,leds) {

    const classes = ['danger', 'success', 'primary','warning'];
    const labels  = ['Valve Water', 'Valve Storage', 'Pumb','Auto/Manual'];
    let uid = 0;
    const buttons = [];
    labels.forEach(label => {
        const button = new Button({
            text     : label,
            uid      : 3-uid,
            className: classes[uid],
            iconLeft : 'lightbulb-o',
            iconRight: 'none',
            callback : ( btn ) => {
                link.ledInv(btn.uid);

                link.ledGet(btn.uid, (uid, sts, err)=>{
                    //console.log(id, sts);
                    leds[3-btn.uid].setStatus( sts );
                    if (btn.uid == 0 & sts == true)
                    {
                        auto = 1;
                    }
                    if (btn.uid == 0 & sts == false)
                    {
                        auto = 0;
                    }
                });
            }
        });
        uid++;
        buttons.push(button);
    });
    return buttons;
    return auto;
}

function main(ui) {
    const link = new WSLink({
        conCallback: (ws) => { },
        datCallback: (ws, evt) => { },
        ledCallback: (ch, sts) => {  },
        pswCallback: (ch, sts,info) => {
            updateSwitchStatus(ch, sts,link);
         },
        adcCallback: (ch, val, dif, dir) => { 
            UpdateGauge(ch, val);
            let vals = val*100/1023
            if( vals > 50 && ch == 0)
            {
                link.buzzer(100, 500*(0));
                alert("Acis is too much");
            }
            if( vals > 30 && ch == 1)
            {
                link.buzzer(100, 500*(1));
                alert("lime is too much");
            }
            if( vals > 85 && ch == 2)
            {
                link.buzzer(100, 500*(2));
                alert("Temp is too much");
            }
            if( vals > 85 && ch == 3)
            {
                link.buzzer(100, 500*(3));
                alert("Temp is too much");
            }
            if( ch == 2 && vals > 60 && Boolean(auto) == true)
            {
                link.pwmStop(2);
                link.pwmStop(3);
                link.pwmDutyRatio(0,0.3);
            }
            if( ch == 3 && vals > 60 && Boolean(auto) == true)
            {
                link.pwmStop(2);
                link.pwmStop(3);
                link.pwmDutyRatio(1,0.3);
            }
         }
    });
    init(link, ui);
}