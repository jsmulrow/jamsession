<!-- info and stuff -->
    <div class="container info">
      <div class="page-header">
        <h1>Jam Session <small>by Jack Mulrow</small></h1>
      </div>
      <div class="row">

        <div class="col-xs-12">
          <ul class="nav nav-tabs nav-justified">
            <li role="presentation" class="active"><a href="#">Home</a></li>
            <li role="presentation"><a href="#">About</a></li>
            <li role="presentation"><a href="#">Profile</a></li>
            <li role="presentation" class="dropdown">
              <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
                Sound Rooms <span class="caret"></span>
              </a>
              <ul class="dropdown-menu">
                <li><a href="#">Room 1</a></li>
                <li><a href="#">Room 2</a></li>
                <li><a href="#">Room 3</a></li>
                <li role="separator" class="divider"></li>
                <li><a href="#">Make a new room</a></li>
              </ul>
            </li>
          </ul>
        </div>

        <!-- <div class="col-sm-12">
          <h3>Information on how to use the app</h3>
        </div> -->
        <div class="col-sm-6">
          <h3>Customization</h3>
          <form id="options" class="form-inline">
            <div class="form-group">
              <label for="oscillator-type">Oscillator Type</label>
              <select class="form-control" id="oscillator-type" name="oscillator-type">
                <option value="square">Square</option>
                <option value="sine">Sine</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div class="form-group">
              <label for="gain-val">Volume</label>
              <select class="form-control" id="gain-val" name="gain-val">
                <option value="0">0</option>
                <option value="0.1">0.1</option>
                <option value="0.2">0.2</option>
                <option value="0.3">0.3</option>
                <option value="0.4">0.4</option>
                <option value="0.5">0.5</option>
                <option value="0.6">0.6</option>
                <option value="0.7">0.7</option>
                <option value="0.8">0.8</option>
                <option value="0.9">0.9</option>
                <option value="1">1</option>
              </select>
            </div>
            <button type="submit" class="btn btn-default">Save</button>
          </form>
        </div>
        <div class="col-sm-6">
          <h3>Other info on how to use the app</h3>
        </div>

      </div>
    </div>