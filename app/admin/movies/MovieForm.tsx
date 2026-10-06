"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./MovieForm.css";

export default function MovieForm({ initialData = null, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter();
  const [movie, setMovie] = useState<any>({
    name: "",
    img: "",
    description: "",
    genre: "",
    rating: "",
    rate: 150,
    theaters: [],
    isHero: false
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setMovie(initialData);
    }
  }, [initialData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setMovie({ ...movie, img: reader.result as string });
      setUploading(false);
      alert("Image selected successfully!");
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("An error occurred while processing the image.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const addTheater = () => {
    setMovie({
      ...movie,
      theaters: [
        ...(movie.theaters || []),
        { theaterId: Date.now().toString(), tname: "", location: "", screens: [] }
      ]
    });
  };

  const updateTheater = (index: number, field: string, value: string) => {
    const updated = [...movie.theaters];
    updated[index][field] = value;
    if (field === 'tname') updated[index].name = value; // compatibility
    setMovie({ ...movie, theaters: updated });
  };

  const removeTheater = (index: number) => {
    const updated = [...movie.theaters];
    updated.splice(index, 1);
    setMovie({ ...movie, theaters: updated });
  };

  const addScreen = (theaterIndex: number) => {
    const updated = [...movie.theaters];
    if (!updated[theaterIndex].screens) updated[theaterIndex].screens = [];
    updated[theaterIndex].screens.push({
      screenId: Date.now().toString(),
      screenName: "",
      capacity: 120,
      screenType: "2D",
      schedules: []
    });
    setMovie({ ...movie, theaters: updated });
  };

  const updateScreen = (tIndex: number, sIndex: number, field: string, value: any) => {
    const updated = [...movie.theaters];
    updated[tIndex].screens[sIndex][field] = value;
    setMovie({ ...movie, theaters: updated });
  };

  const removeScreen = (tIndex: number, sIndex: number) => {
    const updated = [...movie.theaters];
    updated[tIndex].screens.splice(sIndex, 1);
    setMovie({ ...movie, theaters: updated });
  };

  // Schedule Logic (Date)
  const addSchedule = (tIndex: number, sIndex: number) => {
    const updated = [...movie.theaters];
    if (!updated[tIndex].screens[sIndex].schedules) {
      updated[tIndex].screens[sIndex].schedules = [];
    }
    updated[tIndex].screens[sIndex].schedules.push({
      date: "",
      timings: []
    });
    setMovie({ ...movie, theaters: updated });
  };

  const updateScheduleDate = (tIndex: number, sIndex: number, schedIndex: number, dateValue: string) => {
    const updated = [...movie.theaters];
    const scheds = updated[tIndex].screens[sIndex].schedules;
    
    // Duplicate date validation
    if (dateValue) {
      const exists = scheds.find((s: any, idx: number) => idx !== schedIndex && s.date === dateValue);
      if (exists) {
        alert("Shows for this date already exist. Please add another timing to the existing date block.");
        return;
      }
    }

    scheds[schedIndex].date = dateValue;
    setMovie({ ...movie, theaters: updated });
  };

  const removeSchedule = (tIndex: number, sIndex: number, schedIndex: number) => {
    const updated = [...movie.theaters];
    updated[tIndex].screens[sIndex].schedules.splice(schedIndex, 1);
    setMovie({ ...movie, theaters: updated });
  };

  // Timings Logic (Time)
  const addTiming = (tIndex: number, sIndex: number, schedIndex: number) => {
    const updated = [...movie.theaters];
    if (!updated[tIndex].screens[sIndex].schedules[schedIndex].timings) {
      updated[tIndex].screens[sIndex].schedules[schedIndex].timings = [];
    }
    updated[tIndex].screens[sIndex].schedules[schedIndex].timings.push({
      showId: Date.now().toString(),
      startTime: "",
      endTime: "",
      isEditing: true
    });
    setMovie({ ...movie, theaters: updated });
  };

  const updateTiming = (tIndex: number, sIndex: number, schedIndex: number, timingIndex: number, field: string, value: any) => {
    const updated = [...movie.theaters];
    const timing = updated[tIndex].screens[sIndex].schedules[schedIndex].timings[timingIndex];
    timing[field] = value;

    // Auto-calculate end time (3 hours later) if start time is changed
    if (field === 'startTime' && value) {
      const time24 = formatTimeAmPmToInput(value); // 'HH:mm'
      if (time24) {
        let [h, m] = time24.split(":");
        let hours = parseInt(h, 10);
        let mins = parseInt(m, 10);
        
        hours = (hours + 3) % 24;
        
        const strH = hours < 10 ? '0' + hours : hours.toString();
        const strM = mins < 10 ? '0' + mins : mins.toString();
        timing['endTime'] = formatTimeInputToAmPm(`${strH}:${strM}`);
      }
    }

    setMovie({ ...movie, theaters: updated });
  };

  const removeTiming = (tIndex: number, sIndex: number, schedIndex: number, timingIndex: number) => {
    const updated = [...movie.theaters];
    updated[tIndex].screens[sIndex].schedules[schedIndex].timings.splice(timingIndex, 1);
    setMovie({ ...movie, theaters: updated });
  };

  const parseToMinutes = (time12h: string) => {
    if (!time12h) return 0;
    let [time, ampm] = time12h.split(" ");
    if (!time || !ampm) return 0;
    let [h, m] = time.split(":");
    let hours = parseInt(h, 10);
    let mins = parseInt(m, 10);
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  const handleSaveTiming = (tIndex: number, sIndex: number, schedIndex: number, timingIndex: number) => {
    const updated = [...movie.theaters];
    const timing = updated[tIndex].screens[sIndex].schedules[schedIndex].timings[timingIndex];
    
    if (!timing.startTime || !timing.endTime) {
      alert("Please enter both start and end times.");
      return;
    }

    const startMins = parseToMinutes(timing.startTime);
    const endMins = parseToMinutes(timing.endTime);
    
    let duration = endMins - startMins;
    if (duration < 0) duration += 24 * 60; // crossed midnight

    if (duration < 30 || duration > 300) {
      alert(`Invalid time range (${Math.floor(duration/60)}h ${duration%60}m). A movie show typically lasts between 30 mins and 5 hours. Please check your AM/PM selection.`);
      return;
    }

    // Check for overlap within the same date block
    const allTimings = updated[tIndex].screens[sIndex].schedules[schedIndex].timings;
    for (let i = 0; i < allTimings.length; i++) {
      if (i === timingIndex || allTimings[i].isEditing) continue;
      
      const exStart = parseToMinutes(allTimings[i].startTime);
      const exEnd = parseToMinutes(allTimings[i].endTime);
      let exDur = exEnd - exStart;
      if (exDur < 0) exDur += 24 * 60;
      const exEndAdjusted = exStart + exDur;

      const myStart = startMins;
      const myEnd = startMins + duration;

      if (myStart < exEndAdjusted && myEnd > exStart) {
         alert(`Time conflict with existing show from ${allTimings[i].startTime} to ${allTimings[i].endTime}.`);
         return;
      }
    }

    timing.isEditing = false;
    setMovie({ ...movie, theaters: updated });
  };

  const handleEditTiming = (tIndex: number, sIndex: number, schedIndex: number, timingIndex: number) => {
    const updated = [...movie.theaters];
    updated[tIndex].screens[sIndex].schedules[schedIndex].timings[timingIndex].isEditing = true;
    setMovie({ ...movie, theaters: updated });
  };

  const formatTimeInputToAmPm = (time24: string) => {
    if (!time24) return "";
    let [hours, minutes] = time24.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    const strH = h < 10 ? '0' + h : h;
    return `${strH}:${minutes} ${ampm}`;
  };

  const formatTimeAmPmToInput = (time12: string) => {
    if (!time12) return "";
    let [time, ampm] = time12.split(" ");
    if (!time || !ampm) return time12;
    let [h, m] = time.split(":");
    let hours = parseInt(h, 10);
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    const strH = hours < 10 ? '0' + hours : hours;
    return `${strH}:${m}`;
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const url = isEdit ? `http://localhost:8080/api/movies/${movie.id}` : `http://localhost:8080/api/movies/single`;
      const method = isEdit ? "PUT" : "POST";

      // Create a clean copy of the movie object without frontend-only state
      const cleanMovie = JSON.parse(JSON.stringify(movie));
      if (cleanMovie.theaters) {
        cleanMovie.theaters.forEach((theater: any) => {
          if (theater.screens) {
            theater.screens.forEach((screen: any) => {
              if (screen.schedules) {
                screen.schedules.forEach((sched: any) => {
                  delete sched.isEditingDate; // Clean up old properties if any
                  if (sched.timings) {
                    sched.timings.forEach((timing: any) => {
                      delete timing.isEditing;
                    });
                  }
                });
              }
            });
          }
        });
      }
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanMovie)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to save movie");
        return;
      }
      
      alert("Movie saved successfully!");
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while saving.");
    }
  };

  return (
    <div className="movie-form-page">
      <div className="top-nav">
        <button onClick={() => router.push("/admin")} className="back-btn">← Back to Movies</button>
      </div>

      <div className="movie-form-container">
        <h1>{isEdit ? "Edit Movie" : "Add New Movie"}</h1>
        {error && <div className="error-alert">{error}</div>}

        <div className="section-card">
          <h2>Movie Information</h2>
          <label className="checkbox-label">
            <input type="checkbox" checked={movie.isHero || false} onChange={e => setMovie({...movie, isHero: e.target.checked})} />
            Show in Hero Section
          </label>
          
          <div className="form-group">
            <label>Movie Name</label>
            <input value={movie.name || ""} onChange={e => setMovie({...movie, name: e.target.value})} placeholder="Movie Name" />
          </div>

          <div className="form-group">
            <label>Rating</label>
            <input value={movie.rating || ""} onChange={e => setMovie({...movie, rating: e.target.value})} placeholder="8/10" />
          </div>

          <div className="form-group">
            <label>Ticket Rate (₹)</label>
            <input type="number" value={movie.rate || ""} onChange={e => setMovie({...movie, rate: parseInt(e.target.value) || 0})} placeholder="150" />
          </div>

          <div className="form-group">
            <label>Genre</label>
            <input value={movie.genre || ""} onChange={e => setMovie({...movie, genre: e.target.value})} placeholder="Action, Thriller" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={movie.description || ""} onChange={e => setMovie({...movie, description: e.target.value})} placeholder="Movie Description..." rows={4} />
          </div>

          <div className="form-group">
            <label>Movie Poster</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <span>Uploading...</span>}
            {movie.img && <img src={movie.img} alt="Preview" className="poster-preview" />}
          </div>
        </div>

        <div className="section-card">
          <div className="flex-between">
            <h2>Theaters & Screens</h2>
            <button onClick={addTheater} className="btn-add">+ Add Theater</button>
          </div>

          {movie.theaters?.map((theater: any, tIndex: number) => (
            <div key={tIndex} className="theater-card">
              <div className="flex-between">
                <h3>Theater {tIndex + 1}</h3>
                <button onClick={() => confirm("Delete this theater?") && removeTheater(tIndex)} className="btn-delete-small">Delete Theater</button>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Theater Name</label>
                  <input value={theater.tname || theater.name || ""} onChange={e => updateTheater(tIndex, 'tname', e.target.value)} placeholder="Theater Name" />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={theater.location || ""} onChange={e => updateTheater(tIndex, 'location', e.target.value)} placeholder="City, Area" />
                </div>
              </div>

              <div className="screens-container">
                <div className="flex-between">
                  <h4>Screens</h4>
                  <button onClick={() => addScreen(tIndex)} className="btn-add-small">+ Add Screen</button>
                </div>

                {theater.screens?.map((screen: any, sIndex: number) => (
                  <div key={sIndex} className="screen-card">
                     <div className="flex-between">
                        <h5>{screen.screenName || `Screen ${sIndex + 1}`}</h5>
                        <button onClick={() => confirm("Delete this screen?") && removeScreen(tIndex, sIndex)} className="btn-delete-small">Delete Screen</button>
                     </div>
                     
                     <div className="form-row">
                        <div className="form-group">
                          <label>Screen Name / Number</label>
                          <input value={screen.screenName || ""} onChange={e => updateScreen(tIndex, sIndex, 'screenName', e.target.value)} placeholder="Screen 1" />
                        </div>
                        <div className="form-group">
                          <label>Capacity</label>
                          <input type="number" value={screen.capacity || 120} onChange={e => updateScreen(tIndex, sIndex, 'capacity', parseInt(e.target.value))} />
                        </div>
                        <div className="form-group">
                          <label>Screen Type</label>
                          <select value={screen.screenType || "2D"} onChange={e => updateScreen(tIndex, sIndex, 'screenType', e.target.value)}>
                            <option value="2D">2D</option>
                            <option value="3D">3D</option>
                            <option value="IMAX">IMAX</option>
                            <option value="4DX">4DX</option>
                          </select>
                        </div>
                     </div>

                     <div className="shows-container">
                        
                        {screen.schedules?.map((sched: any, schedIndex: number) => (
                          <div key={schedIndex} className="schedule-card">
                            <div className="schedule-header">
                              <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                <label style={{ margin: 0, fontSize: '16px' }}>Date:</label>
                                <input type="date" value={sched.date || ""} onChange={e => updateScheduleDate(tIndex, sIndex, schedIndex, e.target.value)} style={{ padding: '6px' }} />
                              </div>
                              <button onClick={() => confirm("Delete this date and all its timings?") && removeSchedule(tIndex, sIndex, schedIndex)} className="btn-delete-small">Delete Date</button>
                            </div>

                            <div className="timings-list">
                              <p className="timings-label">Timings</p>
                              {(!sched.timings || sched.timings.length === 0) && <p className="no-timings">No timings added yet.</p>}
                              
                              {sched.timings?.map((timing: any, timingIndex: number) => (
                                <div key={timingIndex} className="timing-row">
                                  {timing.isEditing ? (
                                    <div className="inline-edit-form time-edit-form">
                                      <div className="form-group">
                                        <label>Start Time</label>
                                        <input type="time" value={formatTimeAmPmToInput(timing.startTime)} onChange={e => updateTiming(tIndex, sIndex, schedIndex, timingIndex, 'startTime', formatTimeInputToAmPm(e.target.value))} />
                                      </div>
                                      <div className="form-group">
                                        <label>End Time</label>
                                        <input type="time" value={formatTimeAmPmToInput(timing.endTime)} onChange={e => updateTiming(tIndex, sIndex, schedIndex, timingIndex, 'endTime', formatTimeInputToAmPm(e.target.value))} />
                                      </div>
                                      <div className="inline-btns">
                                        <button onClick={() => handleSaveTiming(tIndex, sIndex, schedIndex, timingIndex)} className="btn-save-small">Save</button>
                                        <button onClick={() => removeTiming(tIndex, sIndex, schedIndex, timingIndex)} className="btn-cancel-small">Cancel</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="timing-display">
                                      <span>{timing.startTime} - {timing.endTime}</span>
                                      <div className="inline-btns">
                                        <button onClick={() => handleEditTiming(tIndex, sIndex, schedIndex, timingIndex)} className="btn-edit-small">Edit</button>
                                        <button onClick={() => confirm("Delete this time?") && removeTiming(tIndex, sIndex, schedIndex, timingIndex)} className="btn-delete-small">Delete</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}

                              <button onClick={() => addTiming(tIndex, sIndex, schedIndex)} className="btn-add-time">+ Add Time</button>
                            </div>
                          </div>
                        ))}

                        <button onClick={() => addSchedule(tIndex, sIndex)} className="btn-add-date">+ Add Date</button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bottom-nav">
        <button onClick={() => router.push("/admin")} className="btn-cancel-large">Cancel</button>
        <button onClick={handleSubmit} className="btn-save-large">Save Movie</button>
      </div>
    </div>
  );
}
