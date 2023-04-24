import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { useState } from 'react'
import 'react-day-picker/dist/style.css'

const CustomDayPicker = () => {

    const [selected, setSelected] = useState()

    let footer = <p>Please pick a day.</p>
    if (selected){
        footer = <p>You picked {format(selected, 'PP')}</p>
    }
    return (
        <DayPicker
        mode='single'
        selected={selected}
        onSelect={setSelected}
        footer={footer}
        showOutsideDays
        />
    )
}



export default CustomDayPicker