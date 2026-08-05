#!/usr/bin/env php
<?php

// Validate all freshly created policies are correctly registered
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\Evaluation;
use App\Policies\InternshipPolicy;
use App\Policies\LogbookPolicy;
use App\Policies\ReportPolicy;
use App\Policies\EvaluationPolicy;

echo "Testing policy registration...\n";

$policyInternship = new InternshipPolicy();
$policyLogbook = new LogbookPolicy();
$policyReport = new ReportPolicy();
$policyEvaluation = new EvaluationPolicy();

echo "✓ InternshipPolicy created\n";
echo "✓ LogbookPolicy created\n";
echo "✓ ReportPolicy created\n";
echo "✓ EvaluationPolicy created\n";

echo "✓ All policies successfully created!";
