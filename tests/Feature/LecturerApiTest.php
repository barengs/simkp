<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LecturerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lecturer_endpoint_exists()
    {
        $response = $this->getJson('/api/lecturer');

        $response->assertStatus(200);
    }
}
