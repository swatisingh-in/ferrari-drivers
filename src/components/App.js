import React, { Component } from 'react';
import axios from 'axios';
import '../styles/Base.css';
import '../styles/App.css';

class App extends Component {
  state = {
    driversList : [],
    text : ''
  }

  fetchIfWorldChampion(championDrivers, driverId) {
    if (championDrivers.length > 0) {
      return (championDrivers.findIndex(champion => champion.driverId===driverId) >= 0)
    }
    else {
      return false;
    }
  }

  checkIfDriverExists(driverId) {
    return (this.state.driversList.findIndex(driver => driver.driverId===driverId));
  }

  parseData(allDrivers, championDrivers) {
    if (allDrivers.length > 0) {
      for(let i = 0; i < allDrivers.length; i++) {
        const driverId = allDrivers[i].driverId;
        const fullName = allDrivers[i].givenName + " " + allDrivers[i].familyName;

        const isWorldChampion = this.fetchIfWorldChampion(championDrivers, driverId);
        const index = this.checkIfDriverExists(driverId);

        if (index < 0) {
          this.setState((prevState) => ({
            driversList: prevState.driversList.concat({driverId, fullName, isWorldChampion})
          }));
        }
        else {
          if (this.state.driversList[index].isWorldChampion === false && isWorldChampion) {
            const driversList = this.state.driversList;
            driversList[index].isWorldChampion = isWorldChampion;
            this.setState({
              driversList,
            });
          }
        }
      }
    }
  }

  getVisibleDriverList() {
    return this.state.driversList.filter((driver) => {
      return (driver.fullName.toLowerCase()).includes((this.state.text.toLowerCase()));
    });
  }

  renderDriverDetails() {
    const driversList = this.getVisibleDriverList();

    return driversList.map((driver) => {
      if (driver.isWorldChampion) {
        return <li className="champion" key={driver.driverId}>{driver.fullName}</li>
      }
      else {
        return <li key={driver.driverId}>{driver.fullName}</li>
      }
    })
  }

  onTextChange = (e) => {
    const text = e.target.value;
    this.setState({
      text,
    });
  };

  componentWillMount() {
    const startYear = 1993;
    const endYear = new Date().getFullYear();

    for(let year = startYear; year <= endYear; year++) {
      axios.all([
        axios.get('https://ergast.com/api/f1/' + year + '/constructors/ferrari/drivers.json'),
        axios.get('https://ergast.com/api/f1/' + year + '/constructors/ferrari/results/1/drivers.json')
      ])
      .then(axios.spread((allDrivers, championDrivers) => {
        this.parseData( 
          allDrivers.data.MRData.DriverTable.Drivers, 
          championDrivers.data.MRData.DriverTable.Drivers
        );
      }));
    }
  }

  render() {
    return (
      <div>
        <h1><span>Ferrari</span> Driver List</h1>
        <h2>1993 to current year</h2>
        <input type="text" 
          name="search" 
          placeholder="Filter Drivers.."
          autoFocus={true}
          value={this.state.text}
          onChange = { this.onTextChange }/>
        <ul>
          {
            this.renderDriverDetails()
          }
        </ul>
      </div>
    )
  }
}

export default App;
