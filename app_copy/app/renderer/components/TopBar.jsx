<div>
  <input
    type="text"
    placeholder="Destination name"
    value={newDestName}
    onChange={(e) => setNewDestName(e.target.value)}
  />

  <button onClick={selectDest}>
    Create Destination
  </button>
</div>